"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSession, resolveAuthUser, type AuthResolutionFailureReason } from "./session";
import {
  validateAgencyRegistrationInput,
  type AgencyGender,
  type AgencyRegistrationFieldErrors,
  type AgencyRegistrationInput,
} from "@/lib/validation/agency-registration";
import { AGENCY_EMAIL_PATTERN } from "@/lib/validation/agency";
import { validateAdminProfileInput, type AdminProfileFieldErrors } from "@/lib/validation/profile";
import { validateNewPassword, validatePasswordsMatch } from "@/lib/validation/password";
import { notifyAdminsOfNewAgency } from "@/lib/email/notifyAdmins";
import { panelUrl } from "@/lib/email/panelUrl";

const LOGIN_ERROR_MESSAGES: Record<AuthResolutionFailureReason, string> = {
  "no-role": "Bu hesap için bir rol tanımlı değil. Lütfen yönetici ile iletişime geçin.",
  "no-agency": "Hesabınız henüz bir acenteye bağlanmamış. Lütfen yöneticinizle iletişime geçin.",
  pending: "Başvurunuz inceleniyor. Onaylandığında giriş yapabileceksiniz.",
  rejected: "Başvurunuz reddedildi. Detaylı bilgi için yöneticinizle iletişime geçin.",
};

export interface LoginFormState {
  error: string | null;
  redirectTo?: string;
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // Sadece bu durumu ayır — diğer her hata (yanlış şifre, kullanıcı yok,
    // vb.) aynı genel mesajı alır, kullanıcının var/yok olduğu sızdırılmaz.
    if (error?.code === "email_not_confirmed") {
      return { error: "E-posta adresinizi doğrulamanız gerekiyor. Lütfen mailinizi kontrol edin." };
    }
    return { error: "E-posta veya şifre hatalı." };
  }

  const resolution = await resolveAuthUser(supabase, data.user);
  if (!resolution.user) {
    await supabase.auth.signOut();
    return { error: LOGIN_ERROR_MESSAGES[resolution.reason] };
  }
  const user = resolution.user;

  // Resolved client-side (see login/page.tsx) rather than via redirect()
  // here: redirect()'ing straight out of a useActionState action produced
  // an intermittent "unexpected response was received from the server"
  // error in this Next.js version when combined with proxy.ts.
  return { error: null, redirectTo: user.role === "admin" ? "/admin/dashboard" : "/agent/dashboard" };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export interface RequestPasswordResetFormState {
  fieldError: string | null;
  submitted: boolean;
}

/**
 * "Şifremi unuttum" — e-posta kayıtlı olsun olmasın, formun gördüğü sonuç
 * her zaman aynıdır (`submitted: true`, hiçbir hata metni yok). Supabase'in
 * kendi `resetPasswordForEmail`'i zaten var/yok ayrımını sızdırmayacak
 * şekilde tasarlanmış, ama buradaki HERHANGİ bir hata (rate limit dahil)
 * de yutulur ki cevaptan hesabın var olup olmadığı hiçbir şekilde
 * çıkarılamasın — gerçek hata sadece sunucu loguna düşer. `fieldError`
 * sadece boş/biçimsiz e-posta gibi saf doğrulama hatalarında kullanılır,
 * bunlar bir hesabın var olup olmadığını sızdırmaz.
 */
export async function requestPasswordResetAction(
  _prevState: RequestPasswordResetFormState,
  formData: FormData,
): Promise<RequestPasswordResetFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { fieldError: "E-posta zorunludur.", submitted: false };
  }
  if (!AGENCY_EMAIL_PATTERN.test(email)) {
    return { fieldError: "Lütfen geçerli bir e-posta adresi girin.", submitted: false };
  }

  // `PANEL_BASE_URL` tanımsızsa `redirectTo` hiç eklenmiyor — Supabase'in
  // kendi Site URL'ine düşer (bkz. signUpAction'daki aynı davranış). Bu
  // akışta `redirectTo`'nun `/auth/callback`'e işaret etmesi şart: aksi
  // halde PKCE `code`'u hiçbir zaman bu panelin oturum-değiştirme kodunu
  // çalıştıramaz (bkz. bu değişiklikle verilen "Supabase'de elle
  // yapılması gerekenler" listesi).
  const redirectTo = panelUrl("/auth/callback");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    ...(redirectTo ? { redirectTo } : {}),
  });
  if (error) {
    console.error("[requestPasswordResetAction] Supabase error:", error.message);
  }

  return { fieldError: null, submitted: true };
}

export interface UpdatePasswordFieldErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export interface UpdatePasswordFormState {
  error: string | null;
  fieldErrors: UpdatePasswordFieldErrors;
  /** Sadece oturum hiç yoksa/süresi dolmuşsa true — formda "yeni bağlantı
   * iste" linkinin gösterilip gösterilmeyeceğine bu karar verir (başka bir
   * güncelleme hatasında aynı formu tekrar denemek daha doğru olur). */
  expired?: boolean;
}

/**
 * `/sifre-yenile` formunun sunucu tarafı. Oturum, `/auth/callback`'in
 * `exchangeCodeForSession` ile kurduğu kurtarma (recovery) oturumu —
 * `getSession()` DEĞİL, çağıranın app_metadata.role / acentalar onay
 * durumuna hiç bakmayan ham `supabase.auth.getUser()` kontrolü kullanılıyor:
 * askıda/reddedilmiş bir acente de şifresini yenileyebilmeli, asıl giriş
 * kısıtlaması `loginAction` tarafında aynen kalıyor.
 */
export async function updatePasswordAction(
  _prevState: UpdatePasswordFormState,
  formData: FormData,
): Promise<UpdatePasswordFormState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const newPasswordError = validateNewPassword(newPassword);
  const matchError = newPasswordError
    ? undefined
    : validatePasswordsMatch(newPassword, confirmPassword);
  if (newPasswordError || matchError) {
    return {
      error: null,
      fieldErrors: {
        ...(newPasswordError ? { newPassword: newPasswordError } : {}),
        ...(matchError ? { confirmPassword: matchError } : {}),
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !userData.user) {
    return {
      error: "Bağlantının süresi dolmuş veya geçersiz. Lütfen yeni bir bağlantı isteyin.",
      fieldErrors: {},
      expired: true,
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    if (updateError.code === "same_password") {
      return {
        error: null,
        fieldErrors: {
          newPassword: "Yeni şifre, mevcut şifrenizle aynı olamaz. Lütfen farklı bir şifre girin.",
        },
      };
    }
    if (updateError.code === "weak_password") {
      return {
        error: null,
        fieldErrors: {
          newPassword: "Şifre yeterince güçlü değil. Lütfen daha güçlü bir şifre seçin.",
        },
      };
    }
    return {
      error: "Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
    };
  }

  // `signOut()` bu route segmentinin oturumunu geçersizleştirir; redirectTo
  // alanıyla istemciye bırakmak yerine burada doğrudan redirect() çağrılıyor
  // ki /sifre-yenile, oturumu kapanmış haliyle "bağlantı süresi dolmuş"
  // ekranını hiç render etmesin (bkz. bu değişiklikle giderilen kusur).
  // loginAction'daki proxy.ts kısıtlaması burada geçerli değil — proxy
  // matcher'ı /sifre-yenile'yi kapsamıyor.
  await supabase.auth.signOut();
  redirect("/login?sifre=yenilendi");
}

export type SignUpFieldErrors = AgencyRegistrationFieldErrors & {
  password?: string;
  confirmPassword?: string;
};

export interface SignUpFormState {
  error: string | null;
  fieldErrors: SignUpFieldErrors;
  success: boolean;
}

/**
 * Self-servis acente kaydı. `auth.signUp()` sadece `user_metadata` yazabilir
 * — `app_metadata.role` ataması, bu akış için Supabase'de kurulu
 * `trg_set_default_agent_role` trigger'ına ait (role NULL ise 'agent' yazar).
 * INSERT sonrası her durumda `signOut()` çağrılır ki onay bekleyen bir
 * kullanıcı yarım-oturumda kalmasın — `loginAction`'daki pending/rejected
 * davranışıyla aynı.
 */
export async function signUpAction(formData: FormData): Promise<SignUpFormState> {
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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validation = validateAgencyRegistrationInput(registrationInput);
  const passwordError = validateNewPassword(password);
  const matchError = passwordError ? undefined : validatePasswordsMatch(password, confirmPassword);

  if (!validation.valid || passwordError || matchError) {
    return {
      error: "Lütfen formu kontrol edin.",
      fieldErrors: {
        ...(validation.valid ? {} : validation.fieldErrors),
        ...(passwordError ? { password: passwordError } : {}),
        ...(matchError ? { confirmPassword: matchError } : {}),
      },
      success: false,
    };
  }

  // `PANEL_BASE_URL` tanımsızsa `options` hiç eklenmiyor — Supabase'in kendi
  // proje ayarlarındaki varsayılan Site URL'ine düşer (mevcut davranış).
  const emailRedirectTo = panelUrl("/login?confirmed=1");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.value.email,
    password,
    ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
  });
  if (error || !data.user) {
    const message =
      error?.message === "User already registered"
        ? "Bu e-posta adresi zaten kayıtlı."
        : "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
    return { error: message, fieldErrors: {}, success: false };
  }

  // Confirm-email açıkken, zaten kayıtlı bir e-postayla signUp() çağrıldığında
  // Supabase hata döndürmez — enumeration'ı önlemek için gerçek olmayan bir
  // "user" nesnesi döner, ama `identities` boş/eksik kalır. Bu durumda yeni
  // bir kullanıcı/identity oluşmadığından acentalar'a satır eklenmemeli.
  if (!data.user.identities || data.user.identities.length === 0) {
    return { error: "Bu e-posta adresi zaten kayıtlı.", fieldErrors: {}, success: false };
  }

  // RLS'in acentalar INSERT politikasına güvenmemek için service_role ile
  // yazılıyor — status/user_id gibi alanların kullanıcı tarafından
  // değiştirilemeyeceğini sunucu kodu garanti eder, RLS değil.
  const admin = await createSupabaseAdminClient();
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
    status: "pending",
  });

  // Pending bir kullanıcı yarım-oturumda kalmasın — insert başarısız olsa
  // bile aynı prensip geçerli (bkz. loginAction'daki pending/rejected).
  await supabase.auth.signOut();

  if (insertError) {
    return {
      error: "Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
      success: false,
    };
  }

  await notifyAdminsOfNewAgency({
    acentaIsmi: validation.value.acentaIsmi,
    firstName: validation.value.firstName,
    lastName: validation.value.lastName,
    email: validation.value.email,
    phone: validation.value.phone,
  });

  return { error: null, fieldErrors: {}, success: true };
}

export interface ChangePasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface ChangePasswordFormState {
  error: string | null;
  fieldErrors: ChangePasswordFieldErrors;
  success: boolean;
}

/**
 * Acentenin kendi şifresini değiştirmesi. Mevcut şifre, aynı cookie-tabanlı
 * oturumla `signInWithPassword` çağrılarak doğrulanır (loginAction'ın
 * kullandığı aynı client) — service_role gerekmez, bu tamamen kullanıcının
 * kendi oturumu üzerinden yürür.
 */
export async function changePasswordAction(formData: FormData): Promise<ChangePasswordFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

  const newPasswordError = validateNewPassword(newPassword);
  const matchError = newPasswordError
    ? undefined
    : validatePasswordsMatch(newPassword, confirmNewPassword);

  if (!currentPassword || newPasswordError || matchError) {
    return {
      error: null,
      fieldErrors: {
        ...(!currentPassword ? { currentPassword: "Mevcut şifre zorunludur." } : {}),
        ...(newPasswordError ? { newPassword: newPasswordError } : {}),
        ...(matchError ? { confirmNewPassword: matchError } : {}),
      },
      success: false,
    };
  }

  const user = await getSession();
  if (!user) {
    return { error: "Bu işlem için giriş yapmanız gerekiyor.", fieldErrors: {}, success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) {
    return { error: null, fieldErrors: { currentPassword: "Mevcut şifre hatalı." }, success: false };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return {
      error: "Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
      success: false,
    };
  }

  return { error: null, fieldErrors: {}, success: true };
}

export interface UpdateOwnProfileFormState {
  error: string | null;
  fieldErrors: AdminProfileFieldErrors;
  success: boolean;
}

// Rol app_metadata'dan geliyor; diğer user_metadata anahtarları silinmesin diye mevcutla birleştirilip yazılıyor.
export async function updateOwnProfileAction(formData: FormData): Promise<UpdateOwnProfileFormState> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {}, success: false };
  }

  const validation = validateAdminProfileInput({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors, success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { data: currentUser, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !currentUser.user) {
    return { error: "Bu işlem için giriş yapmanız gerekiyor.", fieldErrors: {}, success: false };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      ...currentUser.user.user_metadata,
      full_name: validation.value.fullName,
      phone: validation.value.phone,
    },
  });
  if (updateError) {
    return {
      error: "Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
      success: false,
    };
  }

  revalidatePath("/admin/ayarlar");
  return { error: null, fieldErrors: {}, success: true };
}
