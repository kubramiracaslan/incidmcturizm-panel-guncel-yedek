"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { updatePasswordAction, type UpdatePasswordFormState } from "@/lib/auth/actions";

const initialState: UpdatePasswordFormState = { error: null, fieldErrors: {} };

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <>
      <h2 className="mb-1 text-headline-md font-headline-md text-on-surface">Yeni Şifre Belirle</h2>
      <p className="mb-6 text-body-md text-on-surface-variant">
        Hesabınız için yeni bir şifre girin.
      </p>

      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="newPassword"
            className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Yeni Şifre
          </label>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
                state.fieldErrors.newPassword
                  ? "border-error focus:border-error focus:ring-error/50"
                  : "border-outline-variant focus:border-mint-glow focus:ring-mint-glow"
              }`}
            />
          </div>
          {state.fieldErrors.newPassword && (
            <p className="mt-1 text-xs text-error">{state.fieldErrors.newPassword}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
          >
            Yeni Şifre (Tekrar)
          </label>
          <div className="relative">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
                state.fieldErrors.confirmPassword
                  ? "border-error focus:border-error focus:ring-error/50"
                  : "border-outline-variant focus:border-mint-glow focus:ring-mint-glow"
              }`}
            />
          </div>
          {state.fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-error">{state.fieldErrors.confirmPassword}</p>
          )}
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            <Icon name="error" className="mt-0.5 flex-shrink-0" />
            <div>
              <span>{state.error}</span>
              {state.expired && (
                <>
                  {" "}
                  <Link href="/sifremi-unuttum" className="font-semibold underline hover:no-underline">
                    Yeni bağlantı iste
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-body-lg font-bold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </>
  );
}
