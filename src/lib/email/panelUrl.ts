/**
 * `PANEL_BASE_URL` + verilen path. Ortam değişkeni tanımsızsa `null` döner —
 * mail şablonları bu durumda ilgili "Panelde Görüntüle" / "Giriş Yap" gibi
 * düğmeleri hiç göstermez (bkz. `templates.ts`'teki `ctaButton`).
 */
export function panelUrl(path: string): string | null {
  const base = process.env.PANEL_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}${path}`;
}
