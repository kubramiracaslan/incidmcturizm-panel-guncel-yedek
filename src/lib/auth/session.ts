import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types";
import { findMockUserById } from "./mock-users";
import {
  SESSION_COOKIE_NAME,
  decodeSessionToken,
  encodeSessionToken,
} from "./session-token";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Reads the current session cookie and resolves it to a user, or null. */
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = decodeSessionToken(token);
  if (!payload) return null;
  return findMockUserById(payload.uid);
}

/** Sets the session cookie for the given user. Called from a server action. */
export async function createSession(user: AuthUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encodeSessionToken({ uid: user.id }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears the session cookie. Called from a server action. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
