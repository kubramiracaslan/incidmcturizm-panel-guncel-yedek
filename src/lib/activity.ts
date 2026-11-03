import type { ActivityItem } from "@/components/dashboard/RecentActivity";
import type { TeklifTalebi } from "@/lib/types";

/** Verilen ISO zaman damgasının Europe/Istanbul takvim tarihini "gg.aa.yyyy"
 * biçiminde döner — hesap UTC epoch üzerinden yapılır, sadece görüntüleme
 * İstanbul saat dilimine göredir. */
function formatIstanbulDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
}

/** Zaman farkı UTC epoch milisaniyeleri üzerinden hesaplanır (saat
 * diliminden bağımsız); 30 gün ve üzerinde İstanbul takvim tarihine
 * dönülür. Türkçede sayıdan sonra çoğul eki olmadığından tekil/çoğul ayrımı
 * yok. */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "az önce";
  if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} gün önce`;
  return formatIstanbulDate(iso);
}

const statusMeta: Record<
  TeklifTalebi["status"],
  { title: string; dotColorClass: string; describe: (r: TeklifTalebi) => string }
> = {
  onaylandi: {
    title: "Talep onaylandı, tura dönüştü",
    dotColorClass: "bg-secondary",
    describe: (r) => `#${r.id} numaralı ${r.tourName} talebi onaylandı. (${r.adults + r.children} Kişi)`,
  },
  beklemede: {
    title: "Yeni talep iletildi",
    dotColorClass: "bg-warning",
    describe: (r) => `${r.tourName} için ${r.adults + r.children} kişilik talep iletildi.`,
  },
  revize_istendi: {
    title: "Revize istendi",
    dotColorClass: "bg-tertiary",
    describe: (r) => `#${r.id} ${r.tourName} talebi için revize istendi.`,
  },
  reddedildi: {
    title: "Talep reddedildi",
    dotColorClass: "bg-error",
    describe: (r) => `#${r.id} ${r.tourName} talebi reddedildi.`,
  },
};

/** `beklemede`'nin zaman referansı talebin oluşturulma anıdır (`createdAt`);
 * diğer durumlar bir DURUM DEĞİŞİKLİĞİNİ anlatır, bu yüzden en son durum
 * değişikliğinin zamanını (`statusChangedAt`) kullanmaları gerekir — aksi
 * halde saatler önce oluşturulup az önce onaylanan bir talep hâlâ "23 saat
 * önce onaylandı" gösterir. `statusChangedAt` migration öncesi satırlarda
 * null olabilir, o durumda `createdAt`'a geri dönülür (eski davranış). */
function timeLabelFor(request: TeklifTalebi): string {
  const reference = request.status === "beklemede" ? request.createdAt : request.statusChangedAt ?? request.createdAt;
  return relativeTime(reference);
}

export function buildActivityFeed(requests: TeklifTalebi[], limit = 4): ActivityItem[] {
  return [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((request) => {
      const meta = statusMeta[request.status];
      return {
        id: request.id,
        title: meta.title,
        description: meta.describe(request),
        timeLabel: timeLabelFor(request),
        dotColorClass: meta.dotColorClass,
      };
    });
}
