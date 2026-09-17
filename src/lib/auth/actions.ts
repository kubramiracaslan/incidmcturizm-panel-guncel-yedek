"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveAuthUser, type AuthResolutionFailureReason } from "./session";

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
