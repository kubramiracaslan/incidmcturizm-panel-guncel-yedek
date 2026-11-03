import type { TourEditData } from "@/lib/types";

interface TourProgramCardProps {
  days: TourEditData["dailyPrograms"];
}

/**
 * "Tur Programı" card — shared by the admin and agent tour detail pages.
 * Read-only; data source and fields are unchanged (`tour_daily_programs`
 * via `TourEditData.dailyPrograms`), only the presentation is a vertical
 * timeline instead of a plain divided list.
 */
export function TourProgramCard({ days }: TourProgramCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-primary-container">
      <div className="border-b border-white/5 px-6 py-4">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Tur Programı</h3>
      </div>

      {days.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-on-surface-variant">
          Bu tur için henüz günlük program girilmedi.
        </p>
      ) : (
        <div className="relative px-6 py-6">
          <div aria-hidden className="absolute bottom-10 left-10 top-10 w-px bg-outline-variant" />
          <div className="space-y-6 sm:space-y-8">
            {days.map((day, index) => (
              <div key={index} className="relative flex gap-4">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary-container sm:h-9 sm:w-9 sm:text-base">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Gün {day.dayRange}
                  </p>
                  <h4 className="mt-1 text-lg font-bold leading-snug text-on-surface sm:text-xl">{day.title}</h4>
                  {day.description && (
                    <p className="mt-2 max-w-[75ch] whitespace-pre-line text-sm leading-relaxed text-on-surface-variant sm:text-[15px]">
                      {day.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
