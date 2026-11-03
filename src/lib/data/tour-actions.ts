"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { repository } from "./index";
import type { CreateTourInput, UpdateTourInput } from "@/lib/types";
import { validateGroupPriceCells, validateTourGeneralInput, type TourGeneralFieldErrors } from "@/lib/validation/tour";

export interface UploadTourImageResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const VALID_IMAGE_TYPES = ["hero", "gallery", "map"] as const;

/** Allowed MIME types for tour images, mapped to the extension used when
 * building the storage path — derived from the sniffed MIME type, not the
 * original filename, so a mislabeled/renamed file can't smuggle in the
 * wrong extension. */
const ALLOWED_TOUR_IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_TOUR_IMAGE_BYTES = 8 * 1024 * 1024;

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
  const ext = ALLOWED_TOUR_IMAGE_MIME_TO_EXT[file.type];
  if (!ext) {
    return { path: null, url: null, error: "Sadece JPG, PNG veya WEBP yüklenebilir." };
  }
  if (file.size > MAX_TOUR_IMAGE_BYTES) {
    return { path: null, url: null, error: "Dosya boyutu en fazla 8MB olabilir." };
  }

  const client = await createSupabaseAdminClient();
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
    baseDateStart: input.baseDateStart,
    baseDateEnd: input.baseDateEnd,
  });
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const groupPriceValidation = validateGroupPriceCells(input.groupPrices);
  if (!groupPriceValidation.valid) {
    return { error: groupPriceValidation.error, fieldErrors: {} };
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

export interface UpdateTourResult {
  error: string | null;
  fieldErrors: TourGeneralFieldErrors;
}

export async function updateTourAction(id: string, input: UpdateTourInput): Promise<UpdateTourResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateTourGeneralInput({
    title: input.title,
    // Slug is immutable on edit and isn't part of `UpdateTourInput` — the
    // shared validator still requires a non-empty value, so pass a
    // placeholder that always passes rather than loosening the validator
    // for this one caller.
    slug: "kept-as-is",
    region: input.region,
    duration: input.duration,
    basePrice: String(input.basePrice),
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
    baseDateStart: input.baseDateStart,
    baseDateEnd: input.baseDateEnd,
  });
  if (!validation.valid) {
    const { slug: _slug, ...fieldErrors } = validation.fieldErrors;
    return { error: "Lütfen formu kontrol edin.", fieldErrors };
  }

  // Grup fiyatları doğrulaması `repository.updateTour` çağrılmadan ÖNCE
  // yapılır — o metot mevcut `tour_group_prices` satırlarını silip yeniden
  // yazıyor; doğrulama burada başarısız olursa o silme hiç başlamaz, yani
  // hatalı bir kayıtta eski fiyatlar kaybolmaz.
  const groupPriceValidation = validateGroupPriceCells(input.groupPrices);
  if (!groupPriceValidation.valid) {
    return { error: groupPriceValidation.error, fieldErrors: {} };
  }

  try {
    await repository.updateTour(id, input);
    revalidatePath("/admin/tur-katalogu");
    revalidatePath(`/admin/tur-katalogu/${id}`);
    return { error: null, fieldErrors: {} };
  } catch (error) {
    console.error("[updateTourAction] Supabase error:", error instanceof Error ? error.message : JSON.stringify(error));
    return { error: "Tur güncellenirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export interface DeleteTourResult {
  error: string | null;
}

export async function deleteTourAction(id: string): Promise<DeleteTourResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.deleteTour(id);
    revalidatePath("/admin/tur-katalogu");
    return { error: null };
  } catch (error) {
    if (error instanceof Error && error.message === "TOUR_HAS_REQUESTS") {
      return { error: "Bu tura ait teklif talepleri olduğu için silinemez." };
    }
    console.error("[deleteTourAction] Supabase error:", error instanceof Error ? error.message : JSON.stringify(error));
    return { error: "Tur silinirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
