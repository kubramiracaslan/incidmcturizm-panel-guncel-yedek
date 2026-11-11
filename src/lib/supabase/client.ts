import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for the site's existing (adminpanel3) database.
 * Read from `SUPABASE_URL` / `SUPABASE_ANON_KEY` (no `NEXT_PUBLIC_` prefix) so
 * these values never ship to the browser — only server components / server
 * actions import this module.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SITE_IMAGES_BUCKET = "site-images";
const TOUR_IMAGES_BUCKET = "tour-images";

/** Site content images (logo, hero, services, map): shared `site-images` bucket. */
export function siteImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Tour images (hero/gallery/map): separate `tour-images` bucket — confirmed
 * against the live site's own `getStorageUrl()`, not `site-images`. */
export function tourImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from(TOUR_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Blog images: bucket depends on the image's *type* (hero vs author), not
 * on the stored value — confirmed against the live site's own reader,
 * which resolves them the same way (fixed bucket per type, filename-only
 * lookup) rather than storing the bucket in the value.
 */
export type BlogImageType = "hero" | "author";
export const BLOG_IMAGE_TYPES: readonly BlogImageType[] = ["hero", "author"];

const BLOG_IMAGE_BUCKETS: Record<BlogImageType, string> = {
  hero: "blog-post-images",
  author: "blog-author-images",
};

export function blogImageBucket(type: BlogImageType): string {
  return BLOG_IMAGE_BUCKETS[type];
}

/** Blog image values are stored as a bare filename (e.g. "1731234567.jpg").
 * Older rows may still hold a subfoldered ("hero/xxx.jpg") or even
 * bucket-prefixed ("blog-post-images/hero/xxx.jpg") value from before this
 * convention — only the last `/`-segment is ever the real filename, so
 * this strips down to that regardless of how many prefixes are present. */
export function blogImageFilename(value: string | null | undefined): string {
  if (!value) return "";
  const segments = value.split("/");
  return segments[segments.length - 1] ?? "";
}

export function blogImageUrl(type: BlogImageType, value: string | null | undefined): string {
  const filename = blogImageFilename(value);
  if (!filename) return "";
  return supabase.storage.from(blogImageBucket(type)).getPublicUrl(filename).data.publicUrl;
}
