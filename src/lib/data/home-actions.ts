"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { repository } from "./index";
import {
  validateHeroInput,
  validatePartnerInput,
  type HeroFieldErrors,
  type PartnerFieldErrors,
} from "@/lib/validation/home";

export interface UploadSiteImageResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const VALID_IMAGE_TYPES = ["logo", "hero", "partner"] as const;
type SiteImageType = (typeof VALID_IMAGE_TYPES)[number];

const MAX_IMAGE_BYTES: Record<SiteImageType, number> = {
  logo: 2 * 1024 * 1024,
  hero: 5 * 1024 * 1024,
  partner: 2 * 1024 * 1024,
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

  const client = await createSupabaseServerClient();
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
    console.error("[updateHomeLogoAction] Supabase error:", error);
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
    console.error("[updateHomeHeroAction] Supabase error:", error);
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
    console.error("[createPartnerAction] Supabase error:", error);
    return { error: "İş ortağı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", fieldErrors: {} };
  }
}
