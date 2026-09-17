"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { NavItem } from "@/lib/nav";
import type { AuthUser } from "@/lib/types";

interface PanelShellProps {
  brandName: string;
  navItems: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
  title: string;
  user: AuthUser;
  searchPlaceholder?: string;
  children: ReactNode;
}

export function PanelShell({
  brandName,
  navItems,
  ctaHref,
  ctaLabel,
  title,
  user,
  searchPlaceholder,
  children,
}: PanelShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        brandName={brandName}
        navItems={navItems}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden md:ml-60">
        <TopBar
          title={title}
          user={user}
          searchPlaceholder={searchPlaceholder}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
