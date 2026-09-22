"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { loginAction, type LoginFormState } from "@/lib/auth/actions";

const initialState: LoginFormState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [state.redirectTo, router]);

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-surface-deep px-4 py-12 sm:px-6 lg:px-8">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-28 w-28 transform transition-transform duration-300 hover:scale-105">
            {/* Işıltı efekti */}
            <div className="absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r from-brand via-mint-glow to-brand opacity-60 blur" />

            {/* Logo konteyner */}
            <div className="relative h-full w-full overflow-hidden rounded-full border border-primary/20 bg-primary-container p-1 shadow-2xl">
              <div className="absolute inset-2 rounded-full border-2 border-mint-glow/30" />
              <div className="flex h-full w-full items-center justify-center p-3">
                <Image
                  src="/logo.png"
                  alt="İnci DMC Turizm"
                  width={96}
                  height={96}
                  className="rounded-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="mt-8 text-center text-headline-lg font-headline-lg font-bold text-primary">
          İnci DMC Turizm
        </h1>
        <p className="mt-2 text-center text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          Acente &amp; Yönetim Paneli
        </p>
      </div>

      <div className="z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel rounded-xl p-8 shadow-2xl">
          <h2 className="mb-1 text-headline-md font-headline-md text-on-surface">Giriş Yap</h2>
          <p className="mb-6 text-body-md text-on-surface-variant">
            Hesabınıza ait e-posta ve şifre ile devam edin.
          </p>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
              >
                E-posta
              </label>
              <div className="relative">
                <Icon
                  name="mail"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="ornek@sirket.com"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-mint-glow focus:outline-none focus:ring-1 focus:ring-mint-glow"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant"
              >
                Şifre
              </label>
              <div className="relative">
                <Icon
                  name="lock"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-outline-variant bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:border-mint-glow focus:outline-none focus:ring-1 focus:ring-mint-glow"
                />
              </div>
            </div>

            {state.error && (
              <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <Icon name="error" className="mt-0.5 flex-shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-body-lg font-bold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                <>
                  <Icon name="login" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="font-semibold text-secondary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-outline-variant/40 bg-surface-container/60 p-4 text-xs text-on-surface-variant">
          <p className="mb-1 font-semibold text-on-surface">Demo giriş bilgileri</p>
          <p>Acente: acente@mail.com / demo1234</p>
          <p>Admin: admin@incidmcturizm.com / demo1234</p>
        </div>
      </div>

      <div className="z-10 mt-12 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} İnci DMC. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
