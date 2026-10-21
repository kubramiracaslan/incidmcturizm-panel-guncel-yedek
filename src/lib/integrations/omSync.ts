  import type { SupabaseClient } from "@supabase/supabase-js";
  import { createSupabaseServerClient } from "@/lib/supabase/server";
  import { createSupabaseAdminClient } from "@/lib/supabase/admin";
  import { repository } from "@/lib/data";
  import type { TeklifTalebi } from "@/lib/types";
  import { sendRequestToOperationManagement, type OmSyncOutcome } from "./operationManagement";

  const MAX_SYNC_ATTEMPTS = 10;
  const BATCH_LIMIT = 20;

  interface AgencyContact {
    email: string;
    phone: string;
  }

  /**
   * OM kapalıyken ("unreachable") deneme sayacı artmaz — talep sonsuza kadar
   * `pending` kalıp otomatik denemeye açık olur. Sayaç sadece OM açık olup bu
   * talebi reddettiğinde ("rejected") artar; 10'a ulaşınca `failed` olur.
   */
  async function applySyncOutcome(
    client: SupabaseClient,
    requestId: string,
    currentAttempts: number,
    outcome: OmSyncOutcome,
  ): Promise<void> {
    if (outcome.ok) {
      const { error } = await client
        .from("talepler")
        .update({ om_sync_status: "sent", om_sync_last_error: null, om_synced_at: new Date().toISOString() })
        .eq("id", requestId);
      if (error) console.error(`[omSync] ${requestId} 'sent' olarak işaretlenemedi:`, error);
      return;
    }

    if (outcome.kind === "unreachable") {
      const { error } = await client
        .from("talepler")
        .update({ om_sync_last_error: outcome.error })
        .eq("id", requestId);
      if (error) console.error(`[omSync] ${requestId} için son hata güncellenemedi:`, error);
      return;
    }

    const attempts = currentAttempts + 1;
    const { error } = await client
      .from("talepler")
      .update({
        om_sync_status: attempts >= MAX_SYNC_ATTEMPTS ? "failed" : "pending",
        om_sync_attempts: attempts,
        om_sync_last_error: outcome.error,
      })
      .eq("id", requestId);
    if (error) console.error(`[omSync] ${requestId} deneme sayısı güncellenemedi:`, error);
  }

  /**
   * Talep onaylandığı anda çağrılır: önce `om_sync_status`'u 'pending' yapar,
   * sonra OM'ye göndermeyi bir kez dener. Burada atılan hiçbir hata admin'in
   * onay işlemine sızmaz — hepsi yutulup loglanır.
   */
  export async function markPendingAndSyncToOperationManagement(
    request: TeklifTalebi,
    agency: AgencyContact,
  ): Promise<void> {
    try {
      const client = await createSupabaseServerClient();
      const { error } = await client
        .from("talepler")
        .update({ om_sync_status: "pending", om_sync_attempts: 0, om_sync_last_error: null })
        .eq("id", request.id);
      if (error) throw error;

      const outcome = await sendRequestToOperationManagement(request, agency);
      await applySyncOutcome(client, request.id, 0, outcome);
    } catch (error) {
      console.error(`[omSync] ${request.id} için senkronizasyon başlatılamadı:`, error);
    }
  }

  /** Admin panelindeki "Şimdi tekrar gönder" butonu tek bir talep için bunu çağırır. */
  export async function retrySingleRequest(requestId: string): Promise<void> {
    const request = await repository.getRequestById(requestId);
    if (!request) return;
    if (request.status !== "onaylandi") return;
    if (request.omSyncStatus !== "pending" && request.omSyncStatus !== "failed") return;

    const agency = await repository.getAgencyById(request.agencyId);
    if (!agency) return;

    const client = await createSupabaseServerClient();
    const outcome = await sendRequestToOperationManagement(request, { email: agency.email, phone: agency.phone });
    await applySyncOutcome(client, request.id, request.omSyncAttempts ?? 0, outcome);
  }

  interface PendingSyncRow {
    id: string;
    tour_id: string;
    agency_id: string;
    adults: number;
    children: number;
    start_date: string;
    nights: number;
    amount: number;
    currency: string;
    notes: string | null;
    created_at: string;
    om_sync_attempts: number | null;
  }

  export interface RetryPendingResult {
    processed: number;
    sent: number;
    failed: number;
    stoppedEarly: boolean;
  }

  /**
   * 'onaylandi' durumundaki ve 'pending' kalan talepleri (en eski onaylıdan
   * başlayarak, en fazla `BATCH_LIMIT` adet) bulup OM'ye yeniden gönderir —
   * `/api/cron/om-sync` tarafından çağrılır. Bir istek bağlantı hatası/timeout
   * ile düşerse ("unreachable") OM'nin o an kapalı olduğu kabul edilip kalan
   * taleplere hiç dokunulmadan durulur.
   */
  export async function retryPendingRequests(): Promise<RetryPendingResult> {
    const client = await createSupabaseAdminClient();

    const { data: rows, error } = await client
      .from("talepler")
      .select(
        "id, tour_id, agency_id, adults, children, start_date, nights, amount, currency, notes, created_at, om_sync_attempts",
      )
      .eq("status", "onaylandi")
      .eq("om_sync_status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_LIMIT);
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return { processed: 0, sent: 0, failed: 0, stoppedEarly: false };
    }

    const pendingRows = rows as PendingSyncRow[];
    const tourIds = Array.from(new Set(pendingRows.map((r) => r.tour_id)));
    const agencyIds = Array.from(new Set(pendingRows.map((r) => r.agency_id)));

    const [{ data: tourRows, error: tourError }, { data: agencyRows, error: agencyError }] = await Promise.all([
      client.from("tours").select("id, title").in("id", tourIds),
      client.from("acentalar").select("id, acenta_ismi, email, telefon").in("id", agencyIds),
    ]);
    // Bu iki sorgu başarısız olursa `tourRows`/`agencyRows` eksik/boş döner —
    // aşağıdaki "satır bulunamadı" mantığı buna bakarak her talebi hatalı
    // şekilde 'failed' işaretlerdi. Sorgu hatası geçici bir altyapı sorunu
    // olabilir (talepler gerçekte var olabilir), bu yüzden hiçbir satıra
    // dokunmadan batch'i güvenle durduruyoruz — talepler 'pending' kalıp bir
    // sonraki cron çalışmasında yeniden denenir.
    if (tourError || agencyError) {
      console.error("[omSync] tours/acentalar sorgusu başarısız, batch güvenle durduruldu:", tourError ?? agencyError);
      return { processed: 0, sent: 0, failed: 0, stoppedEarly: true };
    }

    const tourNameById = new Map((tourRows ?? []).map((t) => [t.id as string, (t.title as string) ?? ""]));
    const agencyById = new Map(
      (agencyRows ?? []).map((a) => [
        a.id as string,
        {
          name: (a.acenta_ismi as string) ?? "",
          email: (a.email as string) ?? "",
          phone: (a.telefon as string) ?? "",
        },
      ]),
    );

    let sent = 0;
    let failedCount = 0;
    let stoppedEarly = false;

    /** Tur veya acente sorgusu başarıyla dönmüş ama bu id'ye karşılık gelen
     * bir satır yoksa, bu geçici değil kalıcı bir veri sorunudur — yeniden
     * denemek düzeltmez. 'pending' bırakıp sonsuza kadar denemek yerine
     * doğrudan 'failed' işaretlenir, neden `om_sync_last_error`'a yazılır. */
    async function markUnresolvable(requestId: string, reason: string): Promise<void> {
      console.error(`[omSync] ${requestId} işlenemedi: ${reason}`);
      const { error: markError } = await client
        .from("talepler")
        .update({ om_sync_status: "failed", om_sync_last_error: reason })
        .eq("id", requestId);
      if (markError) console.error(`[omSync] ${requestId} 'failed' olarak işaretlenemedi:`, markError);
    }

    for (const row of pendingRows) {
      const agency = agencyById.get(row.agency_id);
      if (!agency) {
        await markUnresolvable(row.id, `Acente bulunamadı (agency_id=${row.agency_id})`);
        failedCount++;
        continue;
      }

      const tourName = tourNameById.get(row.tour_id);
      if (tourName === undefined) {
        await markUnresolvable(row.id, `Tur bulunamadı (tour_id=${row.tour_id})`);
        failedCount++;
        continue;
      }

      const request: TeklifTalebi = {
        id: row.id,
        tourId: row.tour_id,
        tourName,
        tourImage: null,
        agencyId: row.agency_id,
        agencyName: agency.name,
        adults: row.adults,
        children: row.children,
        startDate: row.start_date,
        nights: row.nights,
        amount: Number(row.amount) || 0,
        currency: row.currency as TeklifTalebi["currency"],
        status: "onaylandi",
        notes: row.notes ?? "",
        createdAt: row.created_at,
      };

      const outcome = await sendRequestToOperationManagement(request, agency);
      await applySyncOutcome(client, row.id, row.om_sync_attempts ?? 0, outcome);

      if (outcome.ok) {
        sent++;
      } else {
        failedCount++;
        if (outcome.kind === "unreachable") {
          stoppedEarly = true;
          break;
        }
      }
    }

    return { processed: sent + failedCount, sent, failed: failedCount, stoppedEarly };
  }
