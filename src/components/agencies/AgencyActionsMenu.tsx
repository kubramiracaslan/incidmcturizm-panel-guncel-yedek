"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { updateAgencyStatusAction } from "@/lib/data/actions";
import type { AgencyStatus } from "@/lib/types";

interface ActionConfig {
  status: AgencyStatus;
  label: string;
  icon: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmButtonClassName: string;
}

/**
 * Only the transitions valid from `currentStatus` are offered, and a
 * transition that reverses a prior decision (approved→rejected,
 * rejected→approved) gets its own explicit confirmation copy instead of
 * the generic one used for a first-time pending→approved/rejected call.
 */
function buildActions(currentStatus: AgencyStatus, agencyName: string): ActionConfig[] {
  const approve: ActionConfig = {
    status: "approved",
    label: "Onayla",
    icon: "check_circle",
    confirmTitle:
      currentStatus === "rejected"
        ? "Acente kaydını tekrar onaylamak istiyor musunuz?"
        : "Onayla",
    confirmDescription:
      currentStatus === "rejected"
        ? "Bu acente kaydı daha önce reddedildi. Devam ederseniz kaydın durumu Onaylandı olarak değiştirilecektir."
        : `${agencyName} onaylanacak ve panele giriş yapabilecek.`,
    confirmButtonClassName: "bg-brand text-primary-container hover:bg-brand-dark",
  };

  const reject: ActionConfig = {
    status: "rejected",
    label: "Reddet",
    icon: "cancel",
    confirmTitle:
      currentStatus === "approved" ? "Acente kaydını reddetmek istiyor musunuz?" : "Reddet",
    confirmDescription:
      currentStatus === "approved"
        ? "Bu acente kaydı daha önce onaylandı. Devam ederseniz kaydın durumu Reddedildi olarak değiştirilecektir."
        : `${agencyName} reddedilecek ve panele giriş yapamayacak.`,
    confirmButtonClassName: "bg-error text-on-error hover:opacity-90",
  };

  if (currentStatus === "pending") return [approve, reject];
  if (currentStatus === "approved") return [reject];
  return [approve];
}

interface AgencyActionsMenuProps {
  agencyId: string;
  agencyName: string;
  currentStatus: AgencyStatus;
}

export function AgencyActionsMenu({ agencyId, agencyName, currentStatus }: AgencyActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const actions = buildActions(currentStatus, agencyName);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleScroll() {
      setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen]);

  function toggleMenu() {
    if (!menuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setMenuOpen((open) => !open);
  }

  function confirmPendingAction() {
    if (!pendingAction) return;
    const status = pendingAction.status;
    setActionError(null);
    startTransition(async () => {
      const result = await updateAgencyStatusAction(agencyId, status);
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setPendingAction(null);
    });
  }

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        disabled={isPending}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-outline-variant/50 bg-surface-container px-3 py-2 text-sm text-on-surface-variant transition-colors hover:border-outline-variant hover:text-on-surface disabled:opacity-50"
      >
        <span>{isPending ? "İşleniyor..." : "Durumu Değiştir"}</span>
        <Icon name="expand_more" className="text-[18px]" />
      </button>

      {menuOpen && (
        <div
          style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
          className="fixed z-30 overflow-hidden whitespace-normal rounded-lg border border-outline-variant bg-surface-container-high py-1 shadow-lg"
        >
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              onClick={() => {
                setPendingAction(action);
                setActionError(null);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <Icon name={action.icon} className="text-[18px]" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface">
                <Icon name={pendingAction.icon} className="text-xl" />
              </div>
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {pendingAction.confirmTitle}
              </h3>
            </div>
            <p className="mb-4 text-sm text-on-surface-variant">{pendingAction.confirmDescription}</p>
            {actionError && (
              <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {actionError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingAction(null);
                  setActionError(null);
                }}
                className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmPendingAction}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${pendingAction.confirmButtonClassName}`}
              >
                {isPending ? "İşleniyor..." : pendingAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
