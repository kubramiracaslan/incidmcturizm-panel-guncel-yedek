/**
 * Minimal session token encode/decode shared by both the Node runtime
 * (server actions, `lib/auth/session.ts`) and the Edge runtime
 * (`middleware.ts`). Only `atob`/`btoa` are used so the same code runs
 * in both.
 *
 * This is a MOCK session mechanism: the token is just base64 JSON, not
 * signed or encrypted. It exists so the rest of the app (route
 * protection, `getSession()`) can be built against a realistic
 * session-cookie shape today. When the production backend arrives,
 * replace the implementation of this file (e.g. with a signed JWT or a
 * real session-store lookup) — callers of `getSession()` /
 * `requireSession()` do not need to change.
 */

export const SESSION_COOKIE_NAME = "inci_session";

export interface SessionPayload {
  uid: string;
}

export function encodeSessionToken(payload: SessionPayload): string {
  return btoa(JSON.stringify(payload));
}

export function decodeSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(atob(token));
    if (parsed && typeof parsed.uid === "string") {
      return { uid: parsed.uid };
    }
    return null;
  } catch {
    return null;
  }
}
