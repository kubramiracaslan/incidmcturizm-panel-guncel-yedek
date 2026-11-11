"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { requestPasswordResetAction, type RequestPasswordResetFormState } from "@/lib/auth/actions";

const initialState: RequestPasswordResetFormState = { fieldError: null, submitted: false };

export default function SifremiUnuttumPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-surface-deep px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-1/2 -left-48 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <div className="relative h-full w-full overflow-hidden rounded-full border border-primary/20 bg-primary-container p-1 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center p-2">
                <Image
                  src="/logo.png"
                  alt="İnci DMC Turizm"
                  width={72}
                  height={72}
                  className="rounded-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-center text-headline-lg font-headline-lg font-bold text-primary">
          İnci DMC Turizm
        </h1>
        <p className="mt-2 text-center text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          Acente &amp; Yönetim Paneli
        </p>
      </div>

      <div className="z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel rounded-xl p-8 shadow-2xl">
          {state.submitted ? (
            <div className="text-center">
              <Icon name="mark_email_read" className="mb-4 text-5xl text-secondary" />
              <h2 className="mb-2 text-headline-md font-headline-md text-on-surface">
                E-postanızı kontrol edin
              </h2>
              <p className="mb-2 text-body-md text-on-surface-variant">
                Bu e-posta kayıtlıysa şifre yenileme bağlantısı gönderildi.
              </p>
              <p className="mb-6 text-xs text-on-surface-variant">
                Mail için e-posta adresini kontrol ediniz (spam klasörüne de bakınız). Henüz üye
                değilseniz{" "}
                <Link href="/kayit" className="font-semibold text-secondary hover:underline">
                  kayıt olunuz
                </Link>
                .
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-body-md font-semibold text-primary-container transition-colors hover:bg-brand-dark"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-headline-md font-headline-md text-on-surface">
                Şifremi Unuttum
              </h2>
              <p className="mb-6 text-body-md text-on-surface-variant">
                Hesabınıza kayıtlı e-posta adresini girin, şifre yenileme bağlantısı gönderelim.
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
                      className={`w-full rounded-lg border bg-surface-deep py-3 pl-10 pr-4 text-body-lg text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 ${
                        state.fieldError
                          ? "border-error focus:border-error focus:ring-error/50"
                          : "border-outline-variant focus:border-mint-glow focus:ring-mint-glow"
                      }`}
                    />
                  </div>
                  {state.fieldError && (
                    <p className="mt-1 text-xs text-error">{state.fieldError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-body-lg font-bold text-primary-container shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isPending ? "Gönderiliyor..." : "Bağlantı Gönder"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-on-surface-variant">
                <Link href="/login" className="font-semibold text-secondary hover:underline">
                  Giriş sayfasına dön
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="z-10 mt-12 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} İnci DMC. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
