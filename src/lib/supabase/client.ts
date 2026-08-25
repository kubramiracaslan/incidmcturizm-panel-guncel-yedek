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

/** Tour images: path is relative to the shared `site-images` bucket. */
export function siteImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  return supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Blog images: the bucket name is stored as the first path segment (e.g. "blog-post-images/xxx.jpg"). */
export function blogImageUrl(pathWithBucket: string | null | undefined): string {
  if (!pathWithBucket) return "";
  const [bucket, ...rest] = pathWithBucket.split("/");
  const path = rest.join("/");
  if (!bucket || !path) return "";
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
