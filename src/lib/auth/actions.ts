"use server";

import { redirect } from "next/navigation";
import { verifyMockCredentials } from "./mock-users";
import { createSession, destroySession } from "./session";

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

  const user = verifyMockCredentials(email, password);
  if (!user) {
    return { error: "E-posta veya şifre hatalı." };
  }

  await createSession(user);
  // Resolved client-side (see login/page.tsx) rather than via redirect()
  // here: redirect()'ing straight out of a useActionState action produced
  // an intermittent "unexpected response was received from the server"
  // error in this Next.js version when combined with proxy.ts.
  return { error: null, redirectTo: user.role === "admin" ? "/admin/dashboard" : "/agent/dashboard" };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
