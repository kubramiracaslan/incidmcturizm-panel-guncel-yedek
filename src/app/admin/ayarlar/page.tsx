import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

const notificationSettings = [
  {
    icon: "mark_email_unread",
    title: "Yeni talep e-postaları",
    description: "Herhangi bir acenteden yeni bir teklif talebi geldiğinde e-posta alın.",
    defaultChecked: true,
  },
  {
    icon: "group_add",
    title: "Yeni acente kayıtları",
    description: "Yeni bir acente panele kayıt olduğunda bildirim alın.",
    defaultChecked: true,
  },
  {
    icon: "summarize",
    title: "Haftalık özet raporu",
    description: "Her Pazartesi geçen haftanın özet raporunu alın.",
    defaultChecked: false,
  },
];

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Ayarlar">
      <PageHeader title="Ayarlar" description="Bildirim tercihlerinizi yönetin" />

      <div className="rounded-xl border border-white/10 bg-primary-container p-6">
        <h3 className="mb-6 text-headline-sm font-headline-sm font-bold text-on-surface">
          Bildirim Tercihleri
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {notificationSettings.map((setting) => (
            <div
              key={setting.title}
              className="flex items-start gap-4 rounded-lg border border-outline-variant/50 bg-surface-container p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-variant text-secondary">
                <Icon name={setting.icon} className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-on-surface">{setting.title}</p>
                <p className="text-xs text-on-surface-variant">{setting.description}</p>
              </div>
              <ToggleSwitch defaultChecked={setting.defaultChecked} />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
