"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { changeRequestStatusAction } from "@/lib/data/actions";
import type { RequestStatus } from "@/lib/types";

interface ActionConfig {
  status: RequestStatus;
  label: string;
  icon: string;
  menuItemClassName: string;
  confirmButtonClassName: string;
  confirmDescription: (agencyName: string) => string;
}

const actions: ActionConfig[] = [
  {
    status: "onaylandi",
    label: "Onayla",
    icon: "check_circle",
    menuItemClassName: "hover:bg-secondary/10 hover:text-secondary",
    confirmButtonClassName: "bg-brand text-primary-container hover:bg-brand-dark",
    confirmDescription: (agencyName) =>
      `${agencyName} onaylanacak ve durum değişikliğini bildiren bir e-posta ile mesaj kendilerine gönderilecek.`,
  },
  {
    status: "revize_istendi",
    label: "Revize İste",
    icon: "edit_note",
    menuItemClassName: "hover:bg-tertiary/10 hover:text-tertiary",
    confirmButtonClassName: "bg-tertiary text-on-tertiary hover:opacity-90",
    confirmDescription: (agencyName) =>
      `${agencyName} için revize istendiğini bildiren bir e-posta ile mesaj kendilerine gönderilecek.`,
  },
  {
    status: "reddedildi",
    label: "Reddet",
    icon: "cancel",
    menuItemClassName: "hover:bg-error/10 hover:text-error",
    confirmButtonClassName: "bg-error text-on-error hover:opacity-90",
    confirmDescription: (agencyName) =>
      `${agencyName} reddedilecek ve durum değişikliğini bildiren bir e-posta ile mesaj kendilerine gönderilecek.`,
  },
];

interface RequestActionsMenuProps {
  requestId: string;
  agencyName: string;
}

/**
 * Admin-only status control for a single request row. Deliberately requires
 * two separate, explicit clicks (open menu → choose action → confirm) before
 * anything happens, because approving/rejecting/revising a request sends the
 * agency a notification email and message — a stray click must never fire it.
 */
export function RequestActionsMenu({ requestId, agencyName }: RequestActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    // Table cards clip overflow, so the menu is position:fixed (computed
    // from the trigger's viewport position) instead of absolute — it also
    // means the menu would go stale if the table scrolled underneath it,
    // so close it on scroll rather than track and reposition it.
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
      setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setMenuOpen((open) => !open);
  }

  function confirmPendingAction() {
    if (!pendingAction) return;
    const status = pendingAction.status;
    startTransition(() => {
      void changeRequestStatusAction(requestId, status);
    });
    setPendingAction(null);
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Talep işlemleri"
        onClick={toggleMenu}
        className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
      >
        <Icon name="more_vert" className="text-[20px]" />
      </button>

      {menuOpen && (
        <div
          style={{ top: menuPosition.top, right: menuPosition.right }}
          className="fixed z-30 w-48 overflow-hidden whitespace-normal rounded-lg border border-outline-variant bg-surface-container-high py-1 shadow-lg"
        >
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              onClick={() => {
                setPendingAction(action);
                setMenuOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-on-surface transition-colors ${action.menuItemClassName}`}
            >
              <Icon name={action.icon} className="text-[18px]" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {pendingAction && (
        // whitespace-normal overrides the ancestor table's whitespace-nowrap
        // (an inherited CSS property), which otherwise kept this dialog's
        // confirmation text from wrapping.
        <div className="fixed inset-0 z-50 flex items-center justify-center whitespace-normal bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-high p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface">
                <Icon name={pendingAction.icon} className="text-xl" />
              </div>
              <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                {pendingAction.label}
              </h3>
            </div>
            <p className="mb-6 text-sm text-on-surface-variant">
              #{requestId} numaralı talep için <strong className="text-on-surface">{pendingAction.label.toLowerCase()}</strong> işlemini
              onaylıyor musunuz? {pendingAction.confirmDescription(agencyName)}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
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
                {isPending ? "İşleniyor..." : "Evet, Onaylıyorum"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
