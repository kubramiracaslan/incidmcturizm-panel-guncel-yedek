"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { repository } from "./index";
import {
  validateFeaturedSectionInput,
  validateHeroInput,
  validatePartnerInput,
  validateServiceInput,
  validateStatInput,
  type HeroFieldErrors,
  type PartnerFieldErrors,
  type ServiceFieldErrors,
  type StatFieldErrors,
} from "@/lib/validation/home";

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

export interface UploadSiteImageResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const VALID_IMAGE_TYPES = ["logo", "hero", "partner", "service"] as const;
type SiteImageType = (typeof VALID_IMAGE_TYPES)[number];

const MAX_IMAGE_BYTES: Record<SiteImageType, number> = {
  logo: 2 * 1024 * 1024,
  hero: 5 * 1024 * 1024,
  partner: 2 * 1024 * 1024,
  service: 5 * 1024 * 1024,
};

/**
 * Uploads one home-page image to the `site-images` bucket, under a
 * `{imageType}/{timestamp}.{ext}` path — the same convention
 * `uploadTourImageAction` uses for `tour-images`. Returns the stored path
 * so the calling form can persist it once the rest of the form is
 * submitted.
 */
export async function uploadSiteImageAction(formData: FormData): Promise<UploadSiteImageResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { path: null, url: null, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  const file = formData.get("file");
  const imageType = String(formData.get("imageType") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { path: null, url: null, error: "Geçerli bir dosya seçilmedi." };
  }
  if (!VALID_IMAGE_TYPES.includes(imageType as SiteImageType)) {
    return { path: null, url: null, error: "Geçersiz görsel tipi." };
  }
  if (!file.type.startsWith("image/")) {
    return { path: null, url: null, error: "Yalnızca görsel dosyaları yüklenebilir." };
  }
  const maxBytes = MAX_IMAGE_BYTES[imageType as SiteImageType];
  if (file.size > maxBytes) {
    return { path: null, url: null, error: `Dosya boyutu en fazla ${maxBytes / (1024 * 1024)}MB olabilir.` };
  }

  const client = await createSupabaseAdminClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${imageType}/${Date.now()}.${ext}`;

  const { error } = await client.storage.from("site-images").upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) {
    // Log rather than swallow: a storage permission/RLS misconfiguration
    // should show up as a loud server error, not a generic message with no
    // trace of the real cause.
    console.error("[uploadSiteImageAction] Supabase storage error for path=%s:", path, error);
    return { path: null, url: null, error: "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  const { data } = client.storage.from("site-images").getPublicUrl(path);
  return { path, url: data.publicUrl, error: null };
}

export interface UpdateHomeLogoResult {
  error: string | null;
}

export async function updateHomeLogoAction(formData: FormData): Promise<UpdateHomeLogoResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  const logoPath = String(formData.get("logoPath") ?? "").trim();
  if (!logoPath) {
    return { error: "Lütfen bir logo görseli seçin." };
  }

  try {
    await repository.updateHomeLogo({ logoPath });
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    logSupabaseError("updateHomeLogoAction", error);
    return { error: "Logo kaydedilirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export interface UpdateHomeHeroResult {
  error: string | null;
  fieldErrors: HeroFieldErrors;
}

export async function updateHomeHeroAction(formData: FormData): Promise<UpdateHomeHeroResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateHeroInput({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
  });
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const imagePathRaw = formData.get("imagePath");
  const imagePath = typeof imagePathRaw === "string" && imagePathRaw.trim() ? imagePathRaw.trim() : undefined;

  try {
    await repository.updateHomeHero({ ...validation.value, imagePath });
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("updateHomeHeroAction", error);
    return { error: "Hero banner kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export interface CreatePartnerResult {
  error: string | null;
  fieldErrors: PartnerFieldErrors;
}

export async function createPartnerAction(formData: FormData): Promise<CreatePartnerResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validatePartnerInput({
    name: String(formData.get("name") ?? ""),
    websiteUrl: String(formData.get("websiteUrl") ?? ""),
  });
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const logoPath = String(formData.get("logoPath") ?? "").trim();
  if (!logoPath) {
    return { error: "Lütfen bir logo görseli seçin.", fieldErrors: {} };
  }

  try {
    await repository.createPartner({ ...validation.value, logoPath });
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("createPartnerAction", error);
    return { error: "İş ortağı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export interface UpdateFeaturedSectionResult {
  error: string | null;
}

export async function updateFeaturedSectionAction(formData: FormData): Promise<UpdateFeaturedSectionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  const value = validateFeaturedSectionInput({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  try {
    await repository.updateFeaturedSection(value);
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    logSupabaseError("updateFeaturedSectionAction", error);
    return { error: "Bölüm ayarları kaydedilirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export interface SetTourPopularResult {
  error: string | null;
}

export async function setTourPopularAction(tourId: string, isPopular: boolean): Promise<SetTourPopularResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.setTourPopular(tourId, isPopular);
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    if (error instanceof Error && error.message === "MAX_POPULAR_TOURS") {
      return { error: "En fazla 6 tur öne çıkarılabilir." };
    }
    logSupabaseError("setTourPopularAction", error);
    return { error: "Tur güncellenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export interface ServiceActionResult {
  error: string | null;
  fieldErrors: ServiceFieldErrors;
}

function serviceInputFromFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    longDescription: String(formData.get("longDescription") ?? ""),
    iconSvg: String(formData.get("iconSvg") ?? ""),
  };
}

export async function createServiceAction(formData: FormData): Promise<ServiceActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateServiceInput(serviceInputFromFormData(formData));
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const imagePathRaw = formData.get("imagePath");
  const imagePath = typeof imagePathRaw === "string" && imagePathRaw.trim() ? imagePathRaw.trim() : undefined;

  try {
    await repository.createService({ ...validation.value, imagePath });
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("createServiceAction", error);
    return { error: "Bilgilendirme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export async function updateServiceAction(id: string, formData: FormData): Promise<ServiceActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateServiceInput(serviceInputFromFormData(formData));
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  const imagePathRaw = formData.get("imagePath");
  const imagePath = typeof imagePathRaw === "string" && imagePathRaw.trim() ? imagePathRaw.trim() : undefined;

  try {
    await repository.updateService(id, { ...validation.value, imagePath });
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("updateServiceAction", error);
    return { error: "Bilgilendirme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export interface SimpleActionResult {
  error: string | null;
}

export async function deleteServiceAction(id: string): Promise<SimpleActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.deleteService(id);
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    logSupabaseError("deleteServiceAction", error);
    return { error: "Bilgilendirme silinirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export async function updateServiceStatusAction(id: string, isActive: boolean): Promise<SimpleActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.updateServiceStatus(id, isActive);
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    logSupabaseError("updateServiceStatusAction", error);
    return { error: "Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

export interface StatActionResult {
  error: string | null;
  fieldErrors: StatFieldErrors;
}

function statInputFromFormData(formData: FormData) {
  return {
    value: String(formData.get("value") ?? ""),
    label: String(formData.get("label") ?? ""),
    description: String(formData.get("description") ?? ""),
    iconSvg: String(formData.get("iconSvg") ?? ""),
  };
}

export async function createStatAction(formData: FormData): Promise<StatActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateStatInput(statInputFromFormData(formData));
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  try {
    await repository.createStat(validation.value);
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    if (error instanceof Error && error.message === "MAX_STATS") {
      return { error: "En fazla 3 istatistik eklenebilir.", fieldErrors: {} };
    }
    logSupabaseError("createStatAction", error);
    return { error: "İstatistik kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export async function updateStatAction(id: string, formData: FormData): Promise<StatActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateStatInput(statInputFromFormData(formData));
  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  try {
    await repository.updateStat(id, validation.value);
    revalidatePath("/admin/ana-sayfa");
    return { error: null, fieldErrors: {} };
  } catch (error) {
    logSupabaseError("updateStatAction", error);
    return { error: "İstatistik kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}

export async function deleteStatAction(id: string): Promise<SimpleActionResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.deleteStat(id);
    revalidatePath("/admin/ana-sayfa");
    return { error: null };
  } catch (error) {
    logSupabaseError("deleteStatAction", error);
    return { error: "İstatistik silinirken bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
