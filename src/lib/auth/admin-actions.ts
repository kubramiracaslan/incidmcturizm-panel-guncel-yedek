"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  validateAgencyRegistrationInput,
  type AgencyGender,
  type AgencyRegistrationFieldErrors,
  type AgencyRegistrationInput,
} from "@/lib/validation/agency-registration";
import { validateNewPassword } from "@/lib/validation/password";
import { notifyAgencyOfAccountCreated } from "@/lib/email/notifyAgencyStatus";

export type CreateAgencyFieldErrors = AgencyRegistrationFieldErrors & { password?: string };

export interface CreateAgencyFormState {
  error: string | null;
  fieldErrors: CreateAgencyFieldErrors;
  success: boolean;
}

/**
 * Admin'in manuel "Yeni Acente Ekle" akışı — bu dosya `lib/supabase/admin.ts`
 * (service_role) kullanan tek yer. `app_metadata.role` burada açıkça
 * `"agent"` olarak geçiliyor; self-servis kayıttaki `trg_set_default_agent_role`
 * trigger'ına güvenmiyor, kendi rolünü kendi belirliyor.
 */
export async function createAgencyAction(formData: FormData): Promise<CreateAgencyFormState> {
  const currentUser = await getSession();
  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {}, success: false };
  }

  const registrationInput: AgencyRegistrationInput = {
    acentaIsmi: String(formData.get("acentaIsmi") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    mobilePhone: String(formData.get("mobilePhone") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    address: String(formData.get("address") ?? ""),
    gender: String(formData.get("gender") ?? "") as AgencyGender | "",
  };
  const password = String(formData.get("password") ?? "");

  const validation = validateAgencyRegistrationInput(registrationInput);
  const passwordError = validateNewPassword(password);

  if (!validation.valid || passwordError) {
    return {
      error: "Lütfen formu kontrol edin.",
      fieldErrors: {
        ...(validation.valid ? {} : validation.fieldErrors),
        ...(passwordError ? { password: passwordError } : {}),
      },
      success: false,
    };
  }

  const admin = await createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: validation.value.email,
    password,
    email_confirm: true,
    app_metadata: { role: "agent" },
  });
  if (error || !data.user) {
    const message = error?.message.includes("already been registered")
      ? "Bu e-posta adresi zaten kayıtlı."
      : "Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.";
    return { error: message, fieldErrors: {}, success: false };
  }

  const { error: insertError } = await admin.from("acentalar").insert({
    user_id: data.user.id,
    acenta_ismi: validation.value.acentaIsmi,
    isim: validation.value.firstName,
    soyisim: validation.value.lastName,
    email: validation.value.email,
    telefon: validation.value.phone,
    mobil_telefon: validation.value.mobilePhone,
    ulke: validation.value.country,
    sehir: validation.value.city,
    adres: validation.value.address,
    cinsiyet: validation.value.gender,
    status: "approved",
  });

  if (insertError) {
    // acentalar satırı oluşmadıysa auth kullanıcısını da geri al — yarım
    // kalmış, hiçbir acenteye bağlı olmayan bir auth hesabı bırakma.
    await admin.auth.admin.deleteUser(data.user.id);
    return {
      error: "Acente kaydı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
      success: false,
    };
  }

  await notifyAgencyOfAccountCreated({
    email: validation.value.email,
    firstName: validation.value.firstName,
    lastName: validation.value.lastName,
  });

  revalidatePath("/admin/acente-yonetimi");
  return { error: null, fieldErrors: {}, success: true };
}
