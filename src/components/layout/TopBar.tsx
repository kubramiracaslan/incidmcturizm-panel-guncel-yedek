import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { AuthUser } from "@/lib/types";

interface TopBarProps {
  title: string;
  user: AuthUser;
  searchPlaceholder?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, user, searchPlaceholder, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex flex-1 items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Menüyü aç"
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container hover:text-secondary md:hidden"
        >
          <Icon name="menu" />
        </button>
        <h2 className="hidden shrink-0 text-headline-sm font-headline-sm font-semibold text-primary lg:block">
          {title}
        </h2>
        {searchPlaceholder && (
          <div className="relative hidden w-full max-w-md flex-1 rounded-lg transition-shadow focus-within:ring-1 focus-within:ring-secondary sm:block">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 pl-10 pr-4 font-body-md text-sm text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 border-l border-outline-variant/50 pl-2 sm:gap-2 sm:pl-4">
          <button
            aria-label="Bildirimler"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-mint-glow"
          >
            <Icon name="notifications" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-surface bg-error" />
          </button>
          <button
            aria-label="Mesajlar"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-mint-glow sm:flex"
          >
            <Icon name="mail" />
          </button>
          <div className="ml-1 flex items-center gap-2 sm:ml-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/50">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <span className="hidden text-body-md text-on-surface md:inline">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
