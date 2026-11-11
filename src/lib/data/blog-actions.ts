"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BLOG_IMAGE_TYPES, blogImageBucket, type BlogImageType } from "@/lib/supabase/client";
import { repository } from "./index";
import type { BlogPostInput } from "./repository";
import { validateBlogPostInput, type BlogPostFieldErrors } from "@/lib/validation/blog";

/**
 * Some log pipelines (this project's dev server included) serialize the
 * second `console.error` argument with `JSON.stringify`, which silently
 * collapses a thrown `Error` to `{}` — its `message` isn't an own
 * enumerable property. Logging a plain string sidesteps that regardless of
 * which kind of error (Supabase's own, or a bug in this code) was thrown.
 */
function logSupabaseError(context: string, error: unknown) {
  const detail = error instanceof Error ? error.message : JSON.stringify(error);
  console.error(`[${context}] Supabase error: ${detail}`);
}

export interface UploadBlogImageResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Uploads one blog image to its type's bucket (`blog-post-images` for
 * hero, `blog-author-images` for author — see `blogImageBucket()`), as a
 * bare filename with no subfolder. The returned `path` is that bare
 * filename (e.g. `"1731234567.jpg"`) — matching the live site's own
 * reader, which looks up images by filename in a fixed bucket per type
 * rather than reading the bucket from the stored value.
 */
export async function uploadBlogImageAction(formData: FormData): Promise<UploadBlogImageResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { path: null, url: null, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  const file = formData.get("file");
  const imageType = String(formData.get("imageType") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { path: null, url: null, error: "Geçerli bir dosya seçilmedi." };
  }
  if (!BLOG_IMAGE_TYPES.includes(imageType as BlogImageType)) {
    return { path: null, url: null, error: "Geçersiz görsel tipi." };
  }
  if (!file.type.startsWith("image/")) {
    return { path: null, url: null, error: "Yalnızca görsel dosyaları yüklenebilir." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { path: null, url: null, error: "Dosya boyutu en fazla 5MB olabilir." };
  }

  const type = imageType as BlogImageType;
  const bucket = blogImageBucket(type);
  const client = await createSupabaseAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}.${ext}`;

  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) {
    console.error("[uploadBlogImageAction] Supabase storage error for path=%s:", path, error);
    return { path: null, url: null, error: "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, error: null };
}

export interface BlogPostActionResult {
  error: string | null;
  fieldErrors: BlogPostFieldErrors;
}

type BlogPostFormParseResult =
  | { ok: true; input: BlogPostInput }
  | { ok: false; error: string; fieldErrors: BlogPostFieldErrors };

function parseBlogPostFormData(formData: FormData): BlogPostFormParseResult {
  const validation = validateBlogPostInput({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    categoryName: String(formData.get("categoryName") ?? ""),
    readTime: String(formData.get("readTime") ?? ""),
    publishedAt: String(formData.get("publishedAt") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    authorTitle: String(formData.get("authorTitle") ?? ""),
    content: String(formData.get("content") ?? ""),
  });
  if (!validation.valid) {
    return { ok: false, error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const heroImagePath = String(formData.get("heroImagePath") ?? "").trim();
  const authorImagePath = String(formData.get("authorImagePath") ?? "").trim();
  if (!heroImagePath) {
    return { ok: false, error: "Lütfen bir hero görseli yükleyin.", fieldErrors: {} };
  }
  if (!authorImagePath) {
    return { ok: false, error: "Lütfen bir yazar görseli yükleyin.", fieldErrors: {} };
  }

  const tags = formData.getAll("tags").map((t) => String(t));
  const isFeatured = formData.get("isFeatured") === "true";
  const isPublished = formData.get("isPublished") === "true";

  return {
    ok: true,
    input: { ...validation.value, heroImagePath, authorImagePath, tags, isFeatured, isPublished },
  };
}

export async function createBlogPostAction(formData: FormData): Promise<BlogPostActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const parsed = parseBlogPostFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    await repository.createBlogPost(parsed.input);
    revalidatePath("/admin/blog");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("createBlogPostAction", error);
    return { error: "Blog yazısı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export async function updateBlogPostAction(id: string, formData: FormData): Promise<BlogPostActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const parsed = parseBlogPostFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  try {
    await repository.updateBlogPost(id, parsed.input);
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${id}`);
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("updateBlogPostAction", error);
    return { error: "Blog yazısı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export interface SimpleBlogActionResult {
  error: string | null;
}

export async function deleteBlogPostAction(id: string): Promise<SimpleBlogActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.deleteBlogPost(id);
    revalidatePath("/admin/blog");
    return { error: null };
  } catch (error) {
    logSupabaseError("deleteBlogPostAction", error);
    return { error: "Blog yazısı silinirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export async function updateBlogPostStatusAction(id: string, isPublished: boolean): Promise<SimpleBlogActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.updateBlogPostStatus(id, isPublished);
    revalidatePath("/admin/blog");
    return { error: null };
  } catch (error) {
    logSupabaseError("updateBlogPostStatusAction", error);
    return { error: "Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
