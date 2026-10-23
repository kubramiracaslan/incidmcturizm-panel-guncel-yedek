import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { NotificationToggleSwitch } from "@/components/notifications/NotificationToggleSwitch";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { ChangePasswordForm } from "@/components/agent/ChangePasswordForm";
import { getSession } from "@/lib/auth/session";
import { ADMIN_PREFERENCE_DEFAULTS, getNotificationPreferences } from "@/lib/notifications/preferences";

const notificationSettings = [
  {
    key: "yeni_talep_epostalari",
    icon: "mark_email_unread",
    title: "Yeni talep e-postaları",
    description: "Herhangi bir acenteden yeni bir teklif talebi geldiğinde e-posta alın.",
  },
  {
    key: "yeni_acente_kayitlari",
    icon: "group_add",
    title: "Yeni acente kayıtları",
    description: "Yeni bir acente panele kayıt olduğunda bildirim alın.",
  },
  {
    key: "haftalik_ozet_raporu",
    icon: "summarize",
    title: "Haftalık özet raporu",
    description: "Her Pazartesi geçen haftanın özet raporunu alın.",
  },
];

export default async function AdminSettingsPage() {
  const user = await getSession();
  const preferences = user
    ? await getNotificationPreferences(user.id, "admin")
    : ADMIN_PREFERENCE_DEFAULTS;

  return (
    <AdminShell title="Ayarlar">
      <PageHeader title="Ayarlar" description="Hesap ve bildirim tercihlerinizi yönetin" />

      <ProfileForm
        initialFullName={user?.name ?? ""}
        initialPhone={user?.phone ?? ""}
        email={user?.email ?? ""}
      />

      <div className="mt-6">
        <ChangePasswordForm />
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-primary-container p-6">
        <h3 className="mb-6 text-headline-sm font-headline-sm font-bold text-on-surface">
          Bildirim Tercihleri
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start gap-4 rounded-lg border border-outline-variant/50 bg-surface-container p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-variant text-secondary">
                <Icon name={setting.icon} className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-on-surface">{setting.title}</p>
                <p className="text-xs text-on-surface-variant">{setting.description}</p>
              </div>
              <NotificationToggleSwitch
                prefKey={setting.key}
                initialEnabled={preferences[setting.key]}
                label={setting.title}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
