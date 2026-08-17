import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { adminNavItems } from "@/lib/nav";
import { PanelShell } from "./PanelShell";

interface AdminShellProps {
  title: string;
  children: ReactNode;
}

/** Chrome (sidebar + top bar) for every /admin page, plus the session guard. */
export async function AdminShell({ title, children }: AdminShellProps) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <PanelShell
      brandName="İnci DMC Turizm"
      panelLabel="Admin Paneli"
      navItems={adminNavItems}
      ctaHref="/admin/turlar"
      ctaLabel="Yeni Tur Ekle"
      title={title}
      user={user}
      searchPlaceholder="Tur, rezervasyon veya teklif ara..."
    >
      {children}
    </PanelShell>
  );
}
