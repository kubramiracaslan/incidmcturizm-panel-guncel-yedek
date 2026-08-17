import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/session";
import { agentNavItems } from "@/lib/nav";
import { PanelShell } from "./PanelShell";

interface AgentShellProps {
  title: string;
  children: ReactNode;
}

/** Chrome (sidebar + top bar) for every /agent page, plus the session guard. */
export async function AgentShell({ title, children }: AgentShellProps) {
  const user = await getSession();
  if (!user || user.role !== "agent") {
    redirect("/login");
  }

  return (
    <PanelShell
      brandName="İnci DMC Turizm"
      panelLabel="Acente Paneli"
      navItems={agentNavItems}
      ctaHref="/agent/tur-katalogu"
      ctaLabel="Yeni Talep Oluştur"
      title={title}
      user={user}
      searchPlaceholder="Tur, rezervasyon veya talep ara..."
    >
      {children}
    </PanelShell>
  );
}
