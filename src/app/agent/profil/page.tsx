import Image from "next/image";
import { redirect } from "next/navigation";
import { AgentShell } from "@/components/layout/AgentShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { getSession } from "@/lib/auth/session";

export default async function AgentProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const fields = [
    { icon: "person", label: "Ad Soyad", value: user.name },
    { icon: "mail", label: "E-posta", value: user.email },
    { icon: "business", label: "Acente", value: user.agencyName ?? "-" },
    { icon: "badge", label: "Rol", value: "Acente Kullanıcısı" },
  ];

  return (
    <AgentShell title="Profil">
      <PageHeader title="Profil" description="Hesap bilgilerinizi görüntüleyin" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col items-center rounded-xl border border-white/10 bg-primary-container p-8 text-center lg:col-span-4">
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full border border-outline-variant/50">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={96}
              height={96}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
            {user.name}
          </h2>
          <p className="mb-4 text-body-md text-on-surface-variant">{user.agencyName}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
            <Icon name="verified_user" className="text-[14px]" />
            Acente Kullanıcısı
          </span>
        </div>

        <div className="rounded-xl border border-white/10 bg-primary-container p-8 lg:col-span-8">
          <h3 className="mb-6 text-headline-sm font-headline-sm font-bold text-on-surface">
            Hesap Bilgileri
          </h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-4 rounded-lg border border-outline-variant/50 bg-surface-container p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-variant text-secondary">
                  <Icon name={field.icon} className="text-lg" />
                </div>
                <div className="min-w-0">
                  <dt className="text-label-sm font-label-sm uppercase text-on-surface-variant">
                    {field.label}
                  </dt>
                  <dd className="truncate text-body-lg text-on-surface">{field.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-6 rounded-lg border border-outline-variant/40 bg-surface-container/60 p-4 text-xs text-on-surface-variant">
            Hesap bilgilerinizde değişiklik yapmak için İnci DMC Turizm yönetim ekibiyle
            iletişime geçin.
          </p>
        </div>
      </div>
    </AgentShell>
  );
}
