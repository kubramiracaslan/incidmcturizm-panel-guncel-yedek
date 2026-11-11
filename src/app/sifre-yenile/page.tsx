import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Deliberately checks the raw Supabase Auth session (`auth.getUser()`),
 * not this app's `getSession()` — `getSession()` also enforces panel
 * business rules (admin/agent role present, agent's `acentalar` row
 * approved), which would block a pending/rejected agent from reaching this
 * form at all. Resetting a password should work regardless of that status;
 * the approval gate still applies the normal way, at `loginAction`, once
 * they actually try to sign in with the new password.
 */
export default async function SifreYenilePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const hasRecoverySession = Boolean(data.user);

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
          {hasRecoverySession ? (
            <UpdatePasswordForm />
          ) : (
            <div className="text-center">
              <Icon name="link_off" className="mb-4 text-5xl text-error" />
              <h2 className="mb-2 text-headline-md font-headline-md text-on-surface">
                Bağlantının süresi dolmuş
              </h2>
              <p className="mb-6 text-body-md text-on-surface-variant">
                Bu şifre yenileme bağlantısı geçersiz, süresi dolmuş veya daha önce kullanılmış
                olabilir. Yeni bir bağlantı isteyebilirsiniz.
              </p>
              <Link
                href="/sifremi-unuttum"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-body-md font-semibold text-primary-container transition-colors hover:bg-brand-dark"
              >
                Yeni bağlantı iste
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="z-10 mt-12 text-center text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} İnci DMC. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
