"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { LogoutButton } from "./LogoutButton";
import type { NavItem } from "@/lib/nav";

interface SidebarProps {
  brandName: string;
  panelLabel: string;
  navItems: NavItem[];
  ctaHref: string;
  ctaLabel: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  brandName,
  panelLabel,
  navItems,
  ctaHref,
  ctaLabel,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          aria-label="Menüyü kapat"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <nav
        className={`fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-outline-variant bg-surface-deep py-6 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary-container shadow-[0_0_15px_rgba(165,207,194,0.1)]">
            <Image src="/logo.png" alt={brandName} width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-headline-md font-headline-md font-bold leading-tight tracking-tight text-primary">
              {brandName}
            </h1>
            <p className="mt-0.5 text-label-sm font-label-sm uppercase text-on-surface-variant">
              {panelLabel}
            </p>
          </div>
        </div>

        <div className="mb-6 px-4">
          <Link
            href={ctaHref}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-body-md font-semibold text-primary-container shadow-sm transition-colors hover:bg-brand-dark"
          >
            <Icon name="add" filled className="text-lg" />
            {ctaLabel}
          </Link>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "border-l-4 border-secondary bg-surface-container-high font-bold text-secondary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon
                  name={item.icon}
                  filled={isActive}
                  className={`text-xl transition-colors ${
                    isActive ? "" : "group-hover:text-secondary"
                  }`}
                />
                <span className="text-label-sm font-label-sm uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-1 border-t border-outline-variant/30 px-2 pt-4">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="help" />
            <span className="text-label-sm font-label-sm">Destek</span>
          </Link>
          <LogoutButton />
        </div>
      </nav>
    </>
  );
}
