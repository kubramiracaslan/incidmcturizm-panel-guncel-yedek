"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const SUPPORT_EMAIL = "info@incidmcturizm.com";
const SUPPORT_PHONE_DISPLAY = "+90 216 380 58 58";
const SUPPORT_PHONE_HREF = "tel:+902163805858";

type CopiedField = "email" | "phone" | null;

/** Sidebar'ın en altındaki "Destek" butonu — tıklanınca üstünde e-posta ve
 * telefon bilgilerini (gönder/ara + kopyala) gösteren bir popover açar.
 * Dışına tıklayınca veya Esc ile kapanır. */
export function SupportPopover() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<CopiedField>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function copy(field: Exclude<CopiedField, null>, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Panoya erişim engellenmişse sessizce yoksay — "E-posta Gönder"/"Ara"
      // linkleri zaten birincil yol, kopyalama ikincil bir kolaylık.
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      >
        <Icon name="help" />
        <span className="text-label-sm font-label-sm">Destek</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Destek bilgileri"
          className="absolute bottom-full left-2 z-50 mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-outline-variant bg-surface-container-high p-3 shadow-lg"
        >
          <div className="mb-3">
            <p className="mb-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
              E-posta
            </p>
            <p className="mb-2 truncate text-sm text-on-surface">{SUPPORT_EMAIL}</p>
            <div className="flex gap-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex-1 rounded-md border border-outline-variant px-3 py-1.5 text-center text-xs text-on-surface transition-colors hover:bg-surface-container"
              >
                E-posta Gönder
              </a>
              <button
                type="button"
                onClick={() => copy("email", SUPPORT_EMAIL)}
                className="shrink-0 rounded-md border border-outline-variant px-3 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container"
              >
                {copied === "email" ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-3">
            <p className="mb-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
              Telefon
            </p>
            <p className="mb-2 text-sm text-on-surface">{SUPPORT_PHONE_DISPLAY}</p>
            <div className="flex gap-2">
              <a
                href={SUPPORT_PHONE_HREF}
                className="flex-1 rounded-md border border-outline-variant px-3 py-1.5 text-center text-xs text-on-surface transition-colors hover:bg-surface-container"
              >
                Ara
              </a>
              <button
                type="button"
                onClick={() => copy("phone", SUPPORT_PHONE_DISPLAY)}
                className="shrink-0 rounded-md border border-outline-variant px-3 py-1.5 text-xs text-on-surface transition-colors hover:bg-surface-container"
              >
                {copied === "phone" ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
