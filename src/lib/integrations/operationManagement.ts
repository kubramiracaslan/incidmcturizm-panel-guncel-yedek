import type { TeklifTalebi } from "@/lib/types";

const TIMEOUT_MS = 5000;

interface AgencyContact {
  email: string;
  phone: string;
}

function addNights(startDate: string, nights: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + nights);
  return date.toISOString().slice(0, 10);
}

export async function reportApprovedRequestToOperationManagement(
  request: TeklifTalebi,
  agency: AgencyContact,
): Promise<void> {
  const baseUrl = process.env.OPERATION_MANAGEMENT_BASE_URL;
  const secret = process.env.OPERATION_MANAGEMENT_API_SECRET;
  if (!baseUrl || !secret) {
    console.error(`[operationManagement] OPERATION_MANAGEMENT_BASE_URL/SECRET tanımlı değil, ${request.id} iletilemedi.`);
    return;
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
      console.error(`[operationManagement] talep-onaylandi ${request.id} için ${response.status} döndü.`);
    }
  } catch (error) {
    console.error(`[operationManagement] ${request.id} OperationManagement'a iletilemedi:`, error);
  } finally {
    clearTimeout(timeout);
  }
}
