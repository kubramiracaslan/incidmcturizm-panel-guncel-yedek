"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { repository } from "./index";
import type { AgencyStatus, RequestStatus } from "@/lib/types";
import {
  validateAgencyProfileInput,
  type AgencyProfileFieldErrors,
} from "@/lib/validation/agency";
import { notifyAgencyOfRequestStatus } from "@/lib/email/notifyRequestStatus";
import { markPendingAndSyncToOperationManagement, retrySingleRequest } from "@/lib/integrations/omSync";
import { validateRequestStartDate } from "@/lib/validation/request";

export interface CreateRequestFormState {
  error: string | null;
}

export async function createRequestAction(
  tourId: string,
  _prevState: CreateRequestFormState,
  formData: FormData,
): Promise<CreateRequestFormState> {
  const user = await getSession();
  if (!user || user.role !== "agent" || !user.agencyId) {
    return { error: "Bu işlem için acente girişi yapmanız gerekiyor." };
  }

  const startDate = String(formData.get("startDate") ?? "");
  const adults = Number(formData.get("adults") ?? 1);
  const children = Number(formData.get("children") ?? 0);
  const notes = String(formData.get("notes") ?? "");

  if (!startDate) {
    return { error: "Lütfen planlanan başlangıç tarihini seçin." };
  }
  const dateValidation = validateRequestStartDate(startDate);
  if (!dateValidation.valid) {
    return { error: dateValidation.error };
  }
  if (adults < 1) {
    return { error: "En az 1 yetişkin olmalıdır." };
  }

  const tour = await repository.getTourById(tourId);
  if (!tour) {
    return { error: "Tur bulunamadı." };
  }

  const created = await repository.createRequest({
    tourId,
    agencyId: user.agencyId,
    adults,
    children,
    startDate,
    nights: tour.nights,
    notes,
  });

  revalidatePath("/agent/talepler");
  revalidatePath("/agent/dashboard");
  revalidatePath("/admin/talepler");
  revalidatePath("/admin/dashboard");

  redirect(`/agent/talepler?created=${created.id}`);
}

export interface UpdateAgencyStatusResult {
  error: string | null;
}

export async function updateAgencyStatusAction(
  agencyId: string,
  status: AgencyStatus,
): Promise<UpdateAgencyStatusResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.updateAgencyStatus(agencyId, status);
  } catch {
    return { error: "Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/acente-yonetimi");
  return { error: null };
}

export interface UpdateAgencyCanViewPricesResult {
  error: string | null;
}

/** Admin-only, writes via `repository.updateAgencyCanViewPrices`
 * (service_role — see that method's doc comment). */
export async function updateAgencyCanViewPricesAction(
  agencyId: string,
  canViewPrices: boolean,
): Promise<UpdateAgencyCanViewPricesResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor." };
  }

  try {
    await repository.updateAgencyCanViewPrices(agencyId, canViewPrices);
  } catch {
    return { error: "Fiyat görünürlüğü güncellenirken bir hata oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/acente-yonetimi");
  return { error: null };
}

export interface UpdateAgencyProfileResult {
  error: string | null;
  fieldErrors: AgencyProfileFieldErrors;
}

export async function updateAgencyProfileAction(
  agencyId: string,
  formData: FormData,
): Promise<UpdateAgencyProfileResult> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: "Bu işlem için yönetici yetkisi gerekiyor.", fieldErrors: {} };
  }

  const validation = validateAgencyProfileInput({
    acentaIsmi: String(formData.get("acentaIsmi") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!validation.valid) {
    return { error: "Lütfen formu kontrol edin.", fieldErrors: validation.fieldErrors };
  }

  try {
    await repository.updateAgencyProfile(agencyId, validation.value);
  } catch {
    return {
      error: "Kayıt güncellenirken bir hata oluştu. Lütfen tekrar deneyin.",
      fieldErrors: {},
    };
  }

  revalidatePath("/admin/acente-yonetimi");
  return { error: null, fieldErrors: {} };
}

export async function changeRequestStatusAction(
  requestId: string,
  status: RequestStatus,
): Promise<void> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }

  const updated = await repository.updateRequestStatus(requestId, status);

  const agency = await repository.getAgencyById(updated.agencyId);
  if (agency) {
    void notifyAgencyOfRequestStatus(updated, agency.email);
    if (status === "onaylandi") {
      await markPendingAndSyncToOperationManagement(updated, {
        email: agency.email,
        phone: agency.phone,
      });
    }
  }

  revalidatePath("/admin/talepler");
  revalidatePath("/admin/dashboard");
  revalidatePath("/agent/talepler");
  revalidatePath("/agent/dashboard");
}

export async function retryOmSyncAction(requestId: string): Promise<void> {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }

  await retrySingleRequest(requestId);

  revalidatePath("/admin/talepler");
  revalidatePath("/admin/dashboard");
}
