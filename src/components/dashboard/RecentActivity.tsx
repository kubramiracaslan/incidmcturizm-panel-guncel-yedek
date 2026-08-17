import { Icon } from "@/components/ui/Icon";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  dotColorClass: string;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/30 bg-surface-container/50 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-body-lg font-semibold text-on-surface">Son Aktiviteler</h3>
        <button className="rounded p-1 text-on-surface-variant hover:text-secondary">
          <Icon name="more_vert" className="text-[20px]" />
        </button>
      </div>
      <div className="flex flex-col">
        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            Henüz bir aktivite yok.
          </p>
        )}
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`group relative py-3 pl-6 ${
              index !== items.length - 1 ? "border-l border-outline-variant/50" : ""
            }`}
          >
            <div
              className={`absolute left-[-5px] top-[18px] h-2.5 w-2.5 rounded-full border-2 border-surface-container transition-transform group-hover:scale-125 ${item.dotColorClass}`}
            />
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-on-surface">{item.title}</p>
              <span className="shrink-0 text-xs text-on-surface-variant">{item.timeLabel}</span>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
