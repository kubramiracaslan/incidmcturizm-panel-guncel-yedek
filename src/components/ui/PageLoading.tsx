import Image from "next/image";

/**
 * Full-screen loading overlay shared by every panel `loading.tsx` — same
 * idea as the site's own "bekleme ekranı": a full-viewport backdrop in the
 * panel's own background color (`bg-background`, the same token
 * `PanelShell` uses — distinct from the login page's darker
 * `bg-surface-deep`) with the "geçiş" wordmark logo gently pulsing in the
 * center. No sidebar/topbar mimicry here on purpose — App Router swaps this
 * in instantly while the real page (which still renders the real
 * `AdminShell`/`AgentShell`) is loading, so this only needs to cover the
 * screen for that brief moment, not reproduce its layout.
 *
 * Deliberately has no data fetch and no `getSession()` call — any async
 * work here would delay the one thing this file exists to do, which is
 * render immediately.
 */
export function PageLoading() {
  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <span className="sr-only">Yükleniyor</span>
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-brand/10 blur-2xl" />
          <Image
            src="/logo-gecis.png"
            alt=""
            aria-hidden="true"
            width={240}
            height={203}
            className="relative w-[200px] animate-pulse object-contain sm:w-[240px] [animation-duration:2.2s]"
          />
        </div>
        <div className="h-0.5 w-32 overflow-hidden rounded-full bg-surface-container">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-mint-glow/70 [animation-duration:1.4s]" />
        </div>
      </div>
    </div>
  );
}
