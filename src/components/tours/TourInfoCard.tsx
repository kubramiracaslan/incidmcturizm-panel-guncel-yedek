import { Icon } from "@/components/ui/Icon";

interface TourInfoCardProps {
  title: string;
  headerIcon: string;
  headerColorClass: string;
  itemIcon: string;
  itemColorClass: string;
  items: string[];
}

export function TourInfoCard({
  title,
  headerIcon,
  headerColorClass,
  itemIcon,
  itemColorClass,
  items,
}: TourInfoCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6">
      <h3 className="mb-4 flex items-center text-headline-sm font-headline-sm font-bold text-on-surface">
        <Icon name={headerIcon} className={`mr-2 ${headerColorClass}`} />
        {title}
      </h3>
      <ul className="space-y-2 text-body-md text-on-surface-variant">
        {items.map((item) => (
          <li key={item} className="flex items-start">
            <Icon name={itemIcon} className={`mr-2 mt-0.5 text-sm ${itemColorClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
