import type { AuthUser } from "@/lib/types";

/**
 * Stand-in for the user table the production backend will own. Replace
 * with a real lookup (DB query / API call) once it is available — every
 * other file in `lib/auth` only depends on `findMockUserById` and
 * `verifyMockCredentials`, so that is the only place to change.
 */
interface MockAccount {
  password: string;
  user: AuthUser;
}

const mockAccounts: Record<string, MockAccount> = {
  "admin-1": {
    password: "demo1234",
    user: {
      id: "admin-1",
      name: "Emrah İnci",
      email: "admin@incidmcturizm.com",
      role: "admin",
      agencyId: null,
      agencyName: null,
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAujRQwbmHCNJa7bWxJB_hDfcyZn0VHhs7xX06d5HjTNOVMP7N2wgMKHVJxi-iLHHYOMXWlZEYrjSJA3oLsGKnMGUPnG_y3qmMFPRe5vhH764170vFbWdykMMuWxSy_QmNtLUCOS8zck_6Q4a31n_K5wN-434JjYhwGeO55gxsaRjYL2rTPAKgXhBVigsUNACgDINncNg_LTQu36Y9I7z90Ds69PhVgqv616ZH3xYdrcj70Z9e6DUQQ6g",
    },
  },
  "agent-1": {
    password: "demo1234",
    user: {
      id: "agent-1",
      name: "Kübra Miraç Aslan",
      email: "acente@mail.com",
      role: "agent",
      agencyId: "agency-daisy-travel",
      agencyName: "Daisy Travel",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCkAvBjP5AHWfRJ3uAt9viCrST2Pkze4eN5fKYL572sB0TUqkJuo0lIV81Af44AdLz70I8rhjuD8CzsfyS82eEtj3aOeEN-tCADFk5HU4hCy-sxz32oJbWjso78yLSE3DpSe2LGTOmAJeFiVtRJ0DLD4xF5_LK0VrkFoenY9Ymeg5JAfynFOh8Syt2M4wIMFLDYeDuBqXPpzfi8f70QKBLqzwwksgabr_MDL3dODYpWQXPqX8qVKQINWg",
    },
  },
};

export function verifyMockCredentials(email: string, password: string): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const match = Object.values(mockAccounts).find(
    (account) => account.user.email.toLowerCase() === normalizedEmail,
  );
  if (!match || match.password !== password) return null;
  return match.user;
}

export function findMockUserById(id: string): AuthUser | null {
  return mockAccounts[id]?.user ?? null;
}
