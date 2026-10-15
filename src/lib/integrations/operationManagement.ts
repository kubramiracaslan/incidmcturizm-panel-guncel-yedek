import type { TeklifTalebi } from "@/lib/types";

const TIMEOUT_MS = 5000;

interface AgencyContact {
  email: string;
  phone: string;
}

export type OmSyncOutcome =
  | { ok: true }
  // Timeout, DNS/bağlantı hatası veya env eksik — OM'nin kendisi kapalı/erişilemez kabul edilir.
  | { ok: false; kind: "unreachable"; error: string }
  // OM yanıt verdi ama bu isteği reddetti (4xx/5xx) — OM açık, sorun bu talebe özel.
  | { ok: false; kind: "rejected"; error: string };

function addNights(startDate: string, nights: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + nights);
  return date.toISOString().slice(0, 10);
}

export async function sendRequestToOperationManagement(
  request: TeklifTalebi,
  agency: AgencyContact,
): Promise<OmSyncOutcome> {
  const baseUrl = process.env.OPERATION_MANAGEMENT_BASE_URL;
  const secret = process.env.OPERATION_MANAGEMENT_API_SECRET;
  if (!baseUrl || !secret) {
    const error = "OPERATION_MANAGEMENT_BASE_URL/SECRET tanımlı değil";
    console.error(`[operationManagement] ${error}, ${request.id} iletilemedi.`);
    return { ok: false, kind: "unreachable", error };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/api/panel/talep-onaylandi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        tour_name: request.tourName,
        start_date: request.startDate,
        end_date: addNights(request.startDate, request.nights),
        pax: request.adults + request.children,
        agency_name: request.agencyName,
        agency_email: agency.email,
        agency_phone: agency.phone,
        source_request_id: request.id,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = `${response.status} döndü`;
      console.error(`[operationManagement] talep-onaylandi ${request.id} için ${error}.`);
      return { ok: false, kind: "rejected", error };
    }
    return { ok: true };
  } catch (error) {
    console.error(`[operationManagement] ${request.id} OperationManagement'a iletilemedi:`, error);
    return {
      ok: false,
      kind: "unreachable",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}
