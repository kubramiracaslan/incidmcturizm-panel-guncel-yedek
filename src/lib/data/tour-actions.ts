"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { repository } from "./index";
import type { CreateTourInput } from "@/lib/types";
import { validateTourGeneralInput, type TourGeneralFieldErrors } from "@/lib/validation/tour";

export interface UploadTourImageResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const VALID_IMAGE_TYPES = ["hero", "gallery", "map"] as const;

/**
 * Uploads one tour image to the `tour-images` bucket, under a
 * `{imageType}/{timestamp}.{ext}` path — matching exactly what the live
 * site's own `getStorageUrl()` expects (confirmed against real data, not
 * assumed). Returns the stored path so the form can save it on the tour
 * row once the whole form is submitted.
 */
export async function uploadTourImageAction(formData: FormData): Promise<UploadTourImageResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { path: null, url: null, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  const file = formData.get("file");
  const imageType = String(formData.get("imageType") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { path: null, url: null, error: "Geçerli bir dosya seçilmedi." };
  }
  if (!VALID_IMAGE_TYPES.includes(imageType as (typeof VALID_IMAGE_TYPES)[number])) {
    return { path: null, url: null, error: "Geçersiz görsel tipi." };
  }

  const client = await createSupabaseServerClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${imageType}/${Date.now()}.${ext}`;

  const { error } = await client.storage.from("tour-images").upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) {
    // Log rather than swallow: a storage permission/RLS misconfiguration
    // should show up as a loud server error, not a generic message with no
    // trace of the real cause.
    console.error("[uploadTourImageAction] Supabase storage error for path=%s:", path, error);
    return { path: null, url: null, error: "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  const { data } = client.storage.from("tour-images").getPublicUrl(path);
  return { path, url: data.publicUrl, error: null };
}

export interface CreateTourResult {
  error: string | null;
  fieldErrors: TourGeneralFieldErrors;
  tourId?: string;
  slug?: string;
}

export async function createTourAction(input: CreateTourInput): Promise<CreateTourResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateTourGeneralInput({
    title: input.title,
    slug: input.slug,
    region: input.region,
    duration: input.duration,
    basePrice: String(input.basePrice),
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
  });
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  try {
    const created = await repository.createTour(input);
    revalidatePath("/admin/tur-katalogu");
    return { error: null, fieldErrors: {}, tourId: created.id, slug: created.slug };
  } catch (error) {
    console.error("[createTourAction] Supabase error:", error instanceof Error ? error.message : JSON.stringify(error));
    return { error: "Tur kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}
