import { AgentShell } from "@/components/layout/AgentShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { NotificationToggleSwitch } from "@/components/notifications/NotificationToggleSwitch";
import { ChangePasswordForm } from "@/components/agent/ChangePasswordForm";
import { getSession } from "@/lib/auth/session";
import { AGENT_PREFERENCE_DEFAULTS, getNotificationPreferences } from "@/lib/notifications/preferences";

const notificationSettings = [
  {
    key: "talep_durumu_epostalari",
    icon: "mark_email_unread",
    title: "Talep durumu e-postaları",
    description: "Bir talebiniz onaylandığında, reddedildiğinde veya revize istendiğinde e-posta alın.",
  },
  {
    key: "yeni_tur_duyurulari",
    icon: "campaign",
    title: "Yeni tur duyuruları",
    description: "Kataloğa yeni bir tur eklendiğinde bildirim alın.",
  },
];

export default async function AgentSettingsPage() {
  const user = await getSession();
  const preferences = user
    ? await getNotificationPreferences(user.id, "agent")
    : AGENT_PREFERENCE_DEFAULTS;

  return (
    <AgentShell title="Ayarlar">
      <PageHeader title="Ayarlar" description="Bildirim tercihlerinizi yönetin" />

      <div className="rounded-xl border border-white/10 bg-primary-container p-6">
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

      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </AgentShell>
  );
}
