"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { repository } from "./index";
import type { RequestStatus } from "@/lib/types";

export interface CreateRequestFormState {
  error: string | null;
}

export async function createRequestAction(
  tourId: string,
  _prevState: CreateRequestFormState,
  formData: FormData,
): Promise<CreateRequestFormState> {
  const user = await getSession();
  if (!user || user.role !== "agent" || !user.agencyId) {
    return { error: "Bu işlem için acente girişi yapmanız gerekiyor." };
  }

  const startDate = String(formData.get("startDate") ?? "");
  const nights = Number(formData.get("nights") ?? 0);
  const adults = Number(formData.get("adults") ?? 1);
  const children = Number(formData.get("children") ?? 0);
  const notes = String(formData.get("notes") ?? "");

  if (!startDate) {
    return { error: "Lütfen planlanan başlangıç tarihini seçin." };
  }
  if (adults < 1) {
    return { error: "En az 1 yetişkin olmalıdır." };
  }

  const created = await repository.createRequest({
    tourId,
    agencyId: user.agencyId,
    adults,
    children,
    startDate,
    nights,
    notes,
  });

  revalidatePath("/agent/talepler");
  revalidatePath("/agent/dashboard");
  revalidatePath("/admin/talepler");
  revalidatePath("/admin/dashboard");

  redirect(`/agent/talepler?created=${created.id}`);
}

export interface CreateAgencyFormState {
  error: string | null;
  success: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAgencyAction(
  _prevState: CreateAgencyFormState,
  formData: FormData,
): Promise<CreateAgencyFormState> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", success: false };
  }

  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !contactName || !email || !phone) {
    return { error: "Lütfen tüm alanları doldurun.", success: false };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Lütfen geçerli bir e-posta adresi girin.", success: false };
  }

  await repository.createAgency({ name, contactName, email, phone });

  revalidatePath("/admin/acente-yonetimi");

  return { error: null, success: true };
}

export async function changeRequestStatusAction(
  requestId: string,
  status: RequestStatus,
): Promise<void> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }

  await repository.updateRequestStatus(requestId, status);

  revalidatePath("/admin/talepler");
  revalidatePath("/admin/dashboard");
  revalidatePath("/agent/talepler");
  revalidatePath("/agent/dashboard");
}
