import type {
  Agency,
  AgencyFilters,
  AgencyStatus,
  BlogPost,
  CreateRequestInput,
  CreateTourInput,
  Currency,
  DashboardStats,
  FeaturedSectionSettings,
  HomeHeroSettings,
  HomeLogoSettings,
  HomeMapSettings,
  HomePageOverview,
  MapLocation,
  OmSyncStatus,
  Partner,
  RequestFilters,
  RequestStatus,
  SiteService,
  SiteStat,
  TeklifTalebi,
  Tour,
  TourEditData,
  TourFilters,
  TourGroupPriceRow,
  UpdateTourInput,
} from "@/lib/types";
import type {
  BlogPostInput,
  CreatePartnerInput,
  DataRepository,
  ServiceInput,
  StatInput,
  UpdateFeaturedSectionInput,
  UpdateHomeHeroInput,
  UpdateHomeLogoInput,
} from "./repository";
import {
  supabase,
  siteImageUrl,
  tourImageUrl,
  blogImageUrl,
  blogImageBucket,
  blogImageFilename,
  type BlogImageType,
} from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AgencyProfileInput } from "@/lib/validation/agency";
import { generateSlug } from "@/lib/validation/tour";
import { normalizeForSearch } from "@/lib/format";

const AGENCY_COLUMNS = "id, user_id, acenta_ismi, isim, soyisim, email, telefon, status, can_view_prices";

interface AcentalarRow {
  id: string;
  user_id: string;
  acenta_ismi: string | null;
  isim: string | null;
  soyisim: string | null;
  email: string | null;
  telefon: string | null;
  status: string | null;
  can_view_prices: boolean | null;
}

function mapAgencyRow(row: AcentalarRow): Agency {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.acenta_ismi ?? "",
    contactName: [row.isim, row.soyisim].filter(Boolean).join(" "),
    firstName: row.isim ?? "",
    lastName: row.soyisim ?? "",
    email: row.email ?? "",
    phone: row.telefon ?? "",
    status: (row.status as AgencyStatus) ?? "pending",
    canViewPrices: row.can_view_prices ?? true,
  };
}

/** "5 GECE 7 GÜN" -> { nights: 5, days: 7 } */
function parseDuration(duration: string | null | undefined): { nights: number; days: number } {
  if (!duration) return { nights: 0, days: 0 };
  const nightsMatch = duration.match(/(\d+)\s*gece/i);
  const daysMatch = duration.match(/(\d+)\s*g[uü]n/i);
  return {
    nights: nightsMatch ? Number(nightsMatch[1]) : 0,
    days: daysMatch ? Number(daysMatch[1]) : 0,
  };
}

const CURRENCIES = new Set(["TRY", "USD", "EUR", "GBP"]);

interface SupabaseTourRow {
  id: string;
  slug: string;
  title: string;
  region: string;
  duration: string | null;
  base_price: number | null;
  base_price_currency: string | null;
  short_description: string | null;
  long_description: string | null;
  hero_image_path: string | null;
  popular_tour?: boolean | null;
}

interface SupabaseTourContentRow {
  content: string;
  display_order: number | null;
}

function mapTourRow(
  row: SupabaseTourRow,
  extra?: { highlights?: SupabaseTourContentRow[]; includes?: SupabaseTourContentRow[]; notes?: SupabaseTourContentRow[] },
): Tour {
  const { nights, days } = parseDuration(row.duration);
  const currency = CURRENCIES.has(row.base_price_currency ?? "") ? (row.base_price_currency as Tour["currency"]) : "TRY";

  const byOrder = (a: SupabaseTourContentRow, b: SupabaseTourContentRow) =>
    (a.display_order ?? 0) - (b.display_order ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    region: row.region,
    summary: row.short_description ?? "",
    description: row.long_description ?? "",
    coverImage: tourImageUrl(row.hero_image_path),
    nights,
    days,
    startingPrice: row.base_price ?? 0,
    currency,
    themes: [],
    highlights: (extra?.highlights ?? [])
      .slice()
      .sort(byOrder)
      .map((h) => ({ icon: "star", title: h.content, subtitle: "" })),
    includes: (extra?.includes ?? []).slice().sort(byOrder).map((i) => i.content),
    // The live site renders `tour_tips` as the tour's "Dahil Olmayanlar"
    // section (red-X icon, confirmed against inciyeni3's own
    // TourDetailClient.tsx) — not a separate "important notes" concept.
    // `tour_tips` has no other reader in this app, so this is its one and
    // only real identity.
    excludes: (extra?.notes ?? []).slice().sort(byOrder).map((n) => n.content),
    // No table backs a distinct "Önemli Noktalar" concept — see the
    // `excludes` comment above. Kept as an always-empty field (rather than
    // removed) so the admin/agent "Önemli Noktalar" card can stay wired up
    // without inventing storage that doesn't exist.
    importantNotes: [],
    isPopular: row.popular_tour ?? false,
  };
}

const REQUEST_COLUMNS =
  "id, tour_id, agency_id, adults, children, start_date, nights, amount, currency, status, notes, created_at, status_changed_at, om_sync_status, om_sync_attempts, om_sync_last_error, om_synced_at";

interface SupabaseRequestRow {
  id: string;
  tour_id: string;
  agency_id: string;
  adults: number;
  children: number;
  start_date: string;
  nights: number;
  amount: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  /** `supabase/migrations/0003_talepler_status_changed_at.sql` — null for
   * rows created before that migration, or for a row whose status has
   * never changed since. Falls back to `created_at` for display (see
   * `lib/activity.ts`). */
  status_changed_at: string | null;
  om_sync_status: string | null;
  om_sync_attempts: number | null;
  om_sync_last_error: string | null;
  om_synced_at: string | null;
}

function mapRequestRow(
  row: SupabaseRequestRow,
  tour: { title: string; hero_image_path: string | null } | undefined,
  agencyName: string | undefined,
): TeklifTalebi {
  return {
    id: row.id,
    tourId: row.tour_id,
    tourName: tour?.title ?? "",
    tourImage: tour ? tourImageUrl(tour.hero_image_path) : null,
    agencyId: row.agency_id,
    agencyName: agencyName ?? "",
    adults: row.adults,
    children: row.children,
    startDate: row.start_date,
    nights: row.nights,
    amount: Number(row.amount),
    currency: (CURRENCIES.has(row.currency) ? row.currency : "TRY") as TeklifTalebi["currency"],
    status: row.status as RequestStatus,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    statusChangedAt: row.status_changed_at ?? null,
    omSyncStatus: (row.om_sync_status as OmSyncStatus | null) ?? null,
    omSyncAttempts: row.om_sync_attempts ?? 0,
    omSyncLastError: row.om_sync_last_error ?? null,
    omSyncedAt: row.om_synced_at ?? null,
  };
}

/**
 * `talepler` tur/acente adını kendi kolonunda tutmuyor — okuma sırasında
 * `tours`/`acentalar`'dan join'leniyor (bkz. plan: isim/görsel sonradan
 * değişirse talep ekranında güncel kalsın diye). Bir sayfalık sonucun
 * arkasındaki tur/acente satırlarını N+1 yerine tek seferde toplu çekip
 * bellekte eşleştiriyoruz.
 */
async function enrichRequestRows(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  rows: SupabaseRequestRow[],
): Promise<TeklifTalebi[]> {
  if (rows.length === 0) return [];

  const tourIds = Array.from(new Set(rows.map((row) => row.tour_id)));
  const agencyIds = Array.from(new Set(rows.map((row) => row.agency_id)));

  const [{ data: tourRows, error: tourError }, { data: agencyRows, error: agencyError }] =
    await Promise.all([
      client.from("tours").select("id, title, hero_image_path").in("id", tourIds),
      client.from("acentalar").select("id, acenta_ismi").in("id", agencyIds),
    ]);
  if (tourError) throw tourError;
  if (agencyError) throw agencyError;

  const tourMap = new Map(
    (tourRows ?? []).map((row) => [
      row.id as string,
      { title: row.title as string, hero_image_path: row.hero_image_path as string | null },
    ]),
  );
  const agencyNameMap = new Map(
    (agencyRows ?? []).map((row) => [row.id as string, row.acenta_ismi as string]),
  );

  return rows.map((row) =>
    mapRequestRow(row, tourMap.get(row.tour_id), agencyNameMap.get(row.agency_id)),
  );
}

interface ApprovedRevenueRow {
  id: string;
  amount: number;
  currency: string;
}

/**
 * `listRequests` has no `.range()`, so it's capped at the project's
 * PostgREST `db.max_rows` default — fine for the UI table, but a revenue
 * total built on top of it would silently under-count once `talepler`
 * grows past that cap. This fetches amount/currency for approved requests
 * on its own, paging through with `.range()` until a page comes back
 * short, so the total always covers every row regardless of that cap.
 * `.order("id")` keeps row order stable across pages — without it,
 * Postgres is free to return rows in a different order on each page
 * request, which can skip or repeat rows under `.range()`.
 */
async function fetchApprovedRevenueRows(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  filters?: RequestFilters,
): Promise<ApprovedRevenueRow[]> {
  const PAGE_SIZE = 1000;
  const rows: ApprovedRevenueRow[] = [];
  let from = 0;

  while (true) {
    let query = client
      .from("talepler")
      .select("id, amount, currency")
      .eq("status", "onaylandi")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (filters?.agencyId) query = query.eq("agency_id", filters.agencyId);

    const { data, error } = await query;
    if (error) throw error;

    const batch = (data ?? []) as ApprovedRevenueRow[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

/** Groups `fetchApprovedRevenueRows`' flat rows into one total per
 * currency — shared by `getApprovedRevenueByCurrency` and (when no
 * pre-fetched result is passed in) `getDashboardStats`'s own fallback. */
function revenueRowsByCurrency(
  rows: ApprovedRevenueRow[],
): { currency: Currency; amount: number }[] {
  return rows.reduce<{ currency: Currency; amount: number }[]>((acc, row) => {
    if (!CURRENCIES.has(row.currency)) {
      console.error(
        `[getDashboardStats] Tanınmayan para birimi "${row.currency}" (talep id=${row.id}, amount=${row.amount}) - toplamdan hariç tutuldu.`,
      );
      return acc;
    }
    const currency = row.currency as Currency;
    const existing = acc.find((entry) => entry.currency === currency);
    if (existing) {
      existing.amount += Number(row.amount);
    } else {
      acc.push({ currency, amount: Number(row.amount) });
    }
    return acc;
  }, []);
}

interface SupabaseBlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category_name: string | null;
  hero_image: string | null;
  published_at: string | null;
  read_time: number | null;
  author_name: string | null;
  author_title: string | null;
  author_image: string | null;
  tags: { name: string }[] | null;
  content_sections: { type: string; content: string }[] | null;
  is_published: boolean | null;
  is_featured: boolean | null;
}

function mapBlogPostRow(row: SupabaseBlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    categoryName: row.category_name ?? "",
    heroImage: blogImageUrl("hero", row.hero_image),
    heroImagePath: row.hero_image ?? "",
    publishedAt: row.published_at ?? "",
    readTime: row.read_time ?? 0,
    authorName: row.author_name ?? "",
    authorTitle: row.author_title ?? "",
    authorImage: row.author_image ? blogImageUrl("author", row.author_image) : null,
    authorImagePath: row.author_image ?? "",
    tags: (row.tags ?? []).map((t) => t.name),
    contentHtml: (row.content_sections ?? []).map((s) => s.content).join("\n"),
    isPublished: row.is_published ?? false,
    isFeatured: row.is_featured ?? false,
  };
}

const BLOG_POST_COLUMNS =
  "id, slug, title, excerpt, category_name, hero_image, published_at, read_time, author_name, author_title, author_image, tags, content_sections, is_published, is_featured";

/** Best-effort deletes the previous hero/author image file from storage
 * when it was replaced by a new upload this update. `previousValue` may be
 * a bare filename (current convention) or an older subfoldered/
 * bucket-prefixed value — only its last `/`-segment is ever compared or
 * deleted, via `blogImageFilename()`. */
async function removeBlogImageIfReplaced(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  type: BlogImageType,
  previousValue: string | null,
  nextValue: string,
): Promise<void> {
  const previousFilename = blogImageFilename(previousValue);
  if (!previousFilename || previousFilename === blogImageFilename(nextValue)) return;
  const { error } = await client.storage.from(blogImageBucket(type)).remove([previousFilename]);
  if (error) console.error("[updateBlogPost] eski görsel silinemedi:", error);
}

interface SupabaseLogoSettingsRow {
  logo_path: string | null;
}

interface SupabaseHeroSettingsRow {
  title: string | null;
  subtitle: string | null;
  image_path: string | null;
}

interface SupabaseFeaturedSectionRow {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  is_active: boolean | null;
}

interface SupabaseServiceRow {
  id: string;
  name: string | null;
  short_description: string | null;
  long_description: string | null;
  icon_svg: string | null;
  image_path: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface SupabaseMapSettingsRow {
  title: string | null;
  subtitle: string | null;
  map_image_path: string | null;
}

interface SupabaseMapLocationRow {
  id: string;
  name: string | null;
  description: string | null;
  x_position: number | null;
  y_position: number | null;
  is_active: boolean | null;
}

interface SupabaseStatRow {
  id: string;
  title: string | null;
  subtitle_first: string | null;
  subtitle_second: string | null;
  stat_value: number | null;
  stat_label: string | null;
  stat_description: string | null;
  stat_icon_svg: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface SupabasePartnerRow {
  id: string;
  name: string | null;
  logo_path: string | null;
  website_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

function mapService(row: SupabaseServiceRow): SiteService {
  return {
    id: row.id,
    name: row.name ?? "",
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    iconSvg: row.icon_svg ?? "",
    imageUrl: row.image_path ? siteImageUrl(row.image_path) : null,
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? false,
  };
}

function mapMapLocation(row: SupabaseMapLocationRow): MapLocation {
  return {
    id: row.id,
    name: row.name ?? "",
    description: row.description ?? "",
    xPosition: row.x_position ?? 0,
    yPosition: row.y_position ?? 0,
    isActive: row.is_active ?? false,
  };
}

function mapStat(row: SupabaseStatRow): SiteStat {
  return {
    id: row.id,
    title: row.title ?? "",
    subtitleFirst: row.subtitle_first ?? "",
    subtitleSecond: row.subtitle_second ?? "",
    value: row.stat_value ?? 0,
    label: row.stat_label ?? "",
    description: row.stat_description ?? "",
    iconSvg: row.stat_icon_svg ?? "",
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? false,
  };
}

function mapPartner(row: SupabasePartnerRow): Partner {
  return {
    id: row.id,
    name: row.name ?? "",
    logoUrl: row.logo_path ? siteImageUrl(row.logo_path) : null,
    websiteUrl: row.website_url ?? "",
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? false,
  };
}

const byDisplayOrder = <T extends { displayOrder: number }>(a: T, b: T) => a.displayOrder - b.displayOrder;

const MAX_POPULAR_TOURS = 6;
const MAX_STATS = 3;

/**
 * Reads from the site's existing (adminpanel3) Supabase project for
 * concepts that project already has (tours, content). Agencies and quote
 * requests are concepts this panel introduced on its own — they live in
 * `acentalar`/`talepler`, tables this panel's own migrations added.
 */
export class SupabaseDataRepository implements DataRepository {
  async listTours(filters?: TourFilters): Promise<Tour[]> {
    let query = supabase
      .from("tours")
      .select(
        "id, slug, title, region, duration, base_price, base_price_currency, short_description, long_description, hero_image_path, popular_tour",
      )
      .order("created_at", { ascending: false });

    if (filters?.region) {
      query = query.eq("region", filters.region);
    }

    const { data, error } = await query;
    if (error) throw error;
    let rows = (data ?? []) as SupabaseTourRow[];

    if (filters?.search) {
      const term = normalizeForSearch(filters.search.trim());
      if (term) {
        // Matched in JS, not via Postgres `ilike`: `ilike`'s case-folding
        // depends on the database's collation and gets the Turkish
        // İ/I/ı/i problem wrong, so a plain-ASCII search could miss
        // accented Turkish matches. Also covers `short_description`,
        // which the old `ilike` version didn't.
        rows = rows.filter((row) =>
          normalizeForSearch(`${row.title} ${row.region} ${row.short_description ?? ""}`).includes(term),
        );
      }
    }

    return rows.map((row) => mapTourRow(row));
  }

  async listTourRegions(): Promise<string[]> {
    const { data, error } = await supabase.from("tours").select("region");
    if (error) throw error;

    const unique = new Set<string>();
    for (const row of data ?? []) {
      const region = (row.region as string | null)?.trim();
      if (region) unique.add(region);
    }

    return Array.from(unique).sort((a, b) => a.localeCompare(b, "tr"));
  }

  async getTourById(id: string): Promise<Tour | null> {
    const { data: tourRow, error } = await supabase
      .from("tours")
      .select(
        "id, slug, title, region, duration, base_price, base_price_currency, short_description, long_description, hero_image_path",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!tourRow) return null;

    const [
      { data: highlights, error: highlightsError },
      { data: includes, error: includesError },
      { data: tips, error: tipsError },
    ] = await Promise.all([
      supabase.from("tour_highlights").select("content, display_order").eq("tour_id", id),
      supabase.from("tour_inclusions").select("content, display_order").eq("tour_id", id),
      // `tour_tips` has no `display_order` column (confirmed against the
      // live schema) — selecting it here used to fail the whole query
      // silently (the error was never checked, so `tips` quietly became
      // `null`), which is why "Dahil Olmayanlar" always rendered empty.
      supabase.from("tour_tips").select("content").eq("tour_id", id),
    ]);
    if (highlightsError) throw highlightsError;
    if (includesError) throw includesError;
    if (tipsError) throw tipsError;

    return mapTourRow(tourRow as SupabaseTourRow, {
      highlights: (highlights ?? []) as SupabaseTourContentRow[],
      includes: (includes ?? []) as SupabaseTourContentRow[],
      notes: (tips ?? []) as SupabaseTourContentRow[],
    });
  }

  /**
   * Writes a new tour and all of its child-table content in one go. Uses
   * the service-role client (see `lib/supabase/admin.ts`) — unlike the read
   * methods on this class, which only ever read via the shared anon client —
   * because the live project only grants write access to `service_role` on
   * this table; the admin-only check happens in `tour-actions.ts` before
   * this method is ever called.
   */
  async createTour(input: CreateTourInput): Promise<{ id: string; slug: string }> {
    const client = await createSupabaseAdminClient();

    const { data: tourRow, error: tourError } = await client
      .from("tours")
      .insert({
        title: input.title,
        title_en: input.titleEn || null,
        slug: input.slug,
        region: input.region.trim(),
        duration: input.duration,
        duration_en: input.durationEn || null,
        base_price: input.basePrice,
        base_price_currency: input.basePriceCurrency,
        base_date_start: input.baseDateStart || null,
        base_date_end: input.baseDateEnd || null,
        short_description: input.shortDescription,
        short_description_en: input.shortDescriptionEn || null,
        long_description: input.longDescription,
        long_description_en: input.longDescriptionEn || null,
        popular_tour: input.popularTour,
        destination_status: input.destinationStatus,
        opportunity_tour: input.opportunityTour,
        hero_image_path: input.heroImagePath || null,
        tours_map_image: input.toursMapImage || null,
        tours_image_1: input.toursImage1 || null,
        tours_image_2: input.toursImage2 || null,
        tours_image_3: input.toursImage3 || null,
      })
      .select("id, slug")
      .single();
    if (tourError) throw tourError;

    const tourId = tourRow.id as string;

    if (input.highlights.length > 0) {
      const { error } = await client.from("tour_highlights").insert(
        input.highlights.map((h) => ({
          tour_id: tourId,
          content: h.content,
          content_en: h.contentEn || null,
          display_order: h.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.inclusions.length > 0) {
      const { error } = await client.from("tour_inclusions").insert(
        input.inclusions.map((i) => ({
          tour_id: tourId,
          content: i.content,
          content_en: i.contentEn || null,
          display_order: i.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.tips.length > 0) {
      const { error } = await client.from("tour_tips").insert(
        input.tips.map((t) => ({
          tour_id: tourId,
          content: t.content,
          content_en: t.contentEn || null,
          icon_name: t.iconName,
        })),
      );
      if (error) throw error;
    }

    if (input.dailyPrograms.length > 0) {
      const { error } = await client.from("tour_daily_programs").insert(
        input.dailyPrograms.map((p) => ({
          tour_id: tourId,
          day_range: p.dayRange,
          title: p.title,
          title_en: p.titleEn || null,
          description: p.description,
          description_en: p.descriptionEn || null,
        })),
      );
      if (error) throw error;
    }

    if (input.datesPrices.length > 0) {
      const { error } = await client.from("tour_dates_prices").insert(
        input.datesPrices.map((d) => ({
          tour_id: tourId,
          travel_period: d.travelPeriod,
          price_category: d.priceCategory,
          airline: d.airline,
          price: d.price,
          currency: d.currency,
          display_order: d.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.weatherData.length > 0) {
      const { error } = await client.from("tour_weather_data").insert(
        input.weatherData.map((w) => ({
          tour_id: tourId,
          month: w.month,
          temperature: w.temperature,
          rainfall: w.rainfall,
          is_best_period: w.isBestPeriod,
        })),
      );
      if (error) throw error;
    }

    if (input.groupPrices.length > 0) {
      const { error } = await client.from("tour_group_prices").insert(
        input.groupPrices.map((g) => ({
          tour_id: tourId,
          row_label: g.rowLabel,
          group_label: g.groupLabel,
          min_pax: g.minPax,
          price: g.price,
          currency: g.currency,
          sort_order: g.sortOrder,
        })),
      );
      if (error) throw error;
    }

    return { id: tourId, slug: tourRow.slug as string };
  }

  /** Full raw data for the "Turu Düzenle" form — read via the shared anon
   * client, same as `getTourById`; only writes go through service_role. */
  async getTourForEdit(id: string): Promise<TourEditData | null> {
    const { data: tourRow, error } = await supabase
      .from("tours")
      .select(
        "id, slug, title, title_en, region, duration, duration_en, base_price, base_price_currency, base_date_start, base_date_end, short_description, short_description_en, long_description, long_description_en, popular_tour, destination_status, opportunity_tour, hero_image_path, tours_map_image, tours_image_1, tours_image_2, tours_image_3",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!tourRow) return null;

    const [
      { data: highlights, error: highlightsError },
      { data: inclusions, error: inclusionsError },
      { data: tips, error: tipsError },
      { data: dailyPrograms, error: dailyProgramsError },
      { data: datesPrices, error: datesPricesError },
      { data: weatherData, error: weatherDataError },
      groupPrices,
    ] = await Promise.all([
      supabase.from("tour_highlights").select("content, content_en, display_order").eq("tour_id", id).order("display_order"),
      supabase.from("tour_inclusions").select("content, content_en, display_order").eq("tour_id", id).order("display_order"),
      supabase.from("tour_tips").select("content, content_en, icon_name").eq("tour_id", id),
      supabase.from("tour_daily_programs").select("day_range, title, title_en, description, description_en").eq("tour_id", id),
      supabase
        .from("tour_dates_prices")
        .select("travel_period, price_category, airline, price, currency, display_order")
        .eq("tour_id", id)
        .order("display_order"),
      supabase.from("tour_weather_data").select("month, temperature, rainfall, is_best_period").eq("tour_id", id),
      // Was a separate `await` after this block — ran sequentially even
      // though it doesn't depend on any of these results. Folded into the
      // same Promise.all since it's the single slowest query here (RLS
      // policy does a correlated `acentalar` lookup).
      this.getTourGroupPrices(id),
    ]);
    if (highlightsError) throw highlightsError;
    if (inclusionsError) throw inclusionsError;
    if (tipsError) throw tipsError;
    if (dailyProgramsError) throw dailyProgramsError;
    if (datesPricesError) throw datesPricesError;
    if (weatherDataError) throw weatherDataError;

    const currency = (
      CURRENCIES.has(tourRow.base_price_currency ?? "") ? tourRow.base_price_currency : "TRY"
    ) as Tour["currency"];

    return {
      id: tourRow.id as string,
      slug: tourRow.slug as string,
      title: (tourRow.title as string) ?? "",
      titleEn: (tourRow.title_en as string | null) ?? "",
      region: (tourRow.region as string) ?? "",
      duration: (tourRow.duration as string | null) ?? "",
      durationEn: (tourRow.duration_en as string | null) ?? "",
      basePrice: (tourRow.base_price as number | null) ?? 0,
      basePriceCurrency: currency,
      baseDateStart: (tourRow.base_date_start as string | null) ?? "",
      baseDateEnd: (tourRow.base_date_end as string | null) ?? "",
      shortDescription: (tourRow.short_description as string | null) ?? "",
      shortDescriptionEn: (tourRow.short_description_en as string | null) ?? "",
      longDescription: (tourRow.long_description as string | null) ?? "",
      longDescriptionEn: (tourRow.long_description_en as string | null) ?? "",
      popularTour: (tourRow.popular_tour as boolean | null) ?? false,
      destinationStatus: (tourRow.destination_status as boolean | null) ?? false,
      opportunityTour: (tourRow.opportunity_tour as boolean | null) ?? false,
      heroImagePath: (tourRow.hero_image_path as string | null) ?? "",
      heroImageUrl: tourImageUrl(tourRow.hero_image_path as string | null),
      toursMapImage: (tourRow.tours_map_image as string | null) ?? "",
      toursMapImageUrl: tourImageUrl(tourRow.tours_map_image as string | null),
      toursImage1: (tourRow.tours_image_1 as string | null) ?? "",
      toursImage1Url: tourImageUrl(tourRow.tours_image_1 as string | null),
      toursImage2: (tourRow.tours_image_2 as string | null) ?? "",
      toursImage2Url: tourImageUrl(tourRow.tours_image_2 as string | null),
      toursImage3: (tourRow.tours_image_3 as string | null) ?? "",
      toursImage3Url: tourImageUrl(tourRow.tours_image_3 as string | null),
      highlights: (highlights ?? []).map((h) => ({ content: h.content as string, contentEn: (h.content_en as string | null) ?? "" })),
      inclusions: (inclusions ?? []).map((i) => ({ content: i.content as string, contentEn: (i.content_en as string | null) ?? "" })),
      tips: (tips ?? []).map((t) => ({
        content: t.content as string,
        contentEn: (t.content_en as string | null) ?? "",
        iconName: (t.icon_name as string | null) ?? "",
      })),
      dailyPrograms: (dailyPrograms ?? []).map((p) => ({
        dayRange: p.day_range as string,
        title: p.title as string,
        titleEn: (p.title_en as string | null) ?? "",
        description: p.description as string,
        descriptionEn: (p.description_en as string | null) ?? "",
      })),
      datesPrices: (datesPrices ?? []).map((p) => ({
        travelPeriod: p.travel_period as string,
        priceCategory: p.price_category as string,
        airline: (p.airline as string | null) ?? "",
        price: p.price as number,
        currency: (CURRENCIES.has(p.currency as string) ? p.currency : "TRY") as Tour["currency"],
      })),
      weatherData: (weatherData ?? []).map((w) => ({
        month: w.month as string,
        temperature: (w.temperature as number | null) ?? 0,
        rainfall: (w.rainfall as number | null) ?? 0,
        isBestPeriod: (w.is_best_period as boolean | null) ?? false,
      })),
      groupPrices,
    };
  }

  /**
   * Grup fiyatları — `tour_group_prices`'ın RLS politikası SELECT'i admin
   * ve onaylı acenteyle sınırlar, anon'a hiç grant yok. Bu yüzden bu metot
   * (diğer okuma metotlarının çoğunun aksine) paylaşılan anon `supabase`
   * client'ını değil, çağıranın kendi oturumuna bağlı
   * `createSupabaseServerClient()`'ı kullanır — RLS, sorguyu gerçek
   * çağıranın rolüne göre süzsün diye.
   */
  async getTourGroupPrices(tourId: string): Promise<TourGroupPriceRow[]> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("tour_group_prices")
      .select("id, row_label, group_label, min_pax, price, currency, sort_order")
      .eq("tour_id", tourId)
      .order("sort_order");
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      rowLabel: row.row_label as string,
      groupLabel: row.group_label as string,
      minPax: (row.min_pax as number | null) ?? 0,
      price: row.price as number,
      currency: (CURRENCIES.has(row.currency as string) ? row.currency : "TRY") as Tour["currency"],
      sortOrder: (row.sort_order as number | null) ?? 0,
    }));
  }

  /**
   * Updates a tour's own columns and fully replaces its child-table rows
   * (delete then reinsert) — same approach the old panel used. Slug is
   * never part of the update payload (`UpdateTourInput` has no `slug`
   * field), so it cannot change here even by accident. Image columns only
   * change when a new path was actually uploaded this time; otherwise the
   * existing stored path is kept (same convention as `updateService`).
   */
  async updateTour(id: string, input: UpdateTourInput): Promise<{ id: string; slug: string }> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("tours")
      .select("slug, hero_image_path, tours_map_image, tours_image_1, tours_image_2, tours_image_3")
      .eq("id", id)
      .single();
    if (selectError) throw selectError;

    const { data: tourRow, error: tourError } = await client
      .from("tours")
      .update({
        title: input.title,
        title_en: input.titleEn || null,
        region: input.region.trim(),
        duration: input.duration,
        duration_en: input.durationEn || null,
        base_price: input.basePrice,
        base_price_currency: input.basePriceCurrency,
        base_date_start: input.baseDateStart || null,
        base_date_end: input.baseDateEnd || null,
        short_description: input.shortDescription,
        short_description_en: input.shortDescriptionEn || null,
        long_description: input.longDescription,
        long_description_en: input.longDescriptionEn || null,
        popular_tour: input.popularTour,
        destination_status: input.destinationStatus,
        opportunity_tour: input.opportunityTour,
        hero_image_path: input.heroImagePath || existing.hero_image_path,
        tours_map_image: input.toursMapImage || existing.tours_map_image,
        tours_image_1: input.toursImage1 || existing.tours_image_1,
        tours_image_2: input.toursImage2 || existing.tours_image_2,
        tours_image_3: input.toursImage3 || existing.tours_image_3,
      })
      .eq("id", id)
      .select("id, slug")
      .single();
    if (tourError) throw tourError;

    const childTables = [
      "tour_highlights",
      "tour_inclusions",
      "tour_tips",
      "tour_daily_programs",
      "tour_dates_prices",
      "tour_weather_data",
      "tour_group_prices",
    ] as const;
    for (const table of childTables) {
      const { error } = await client.from(table).delete().eq("tour_id", id);
      if (error) throw error;
    }

    if (input.highlights.length > 0) {
      const { error } = await client.from("tour_highlights").insert(
        input.highlights.map((h) => ({
          tour_id: id,
          content: h.content,
          content_en: h.contentEn || null,
          display_order: h.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.inclusions.length > 0) {
      const { error } = await client.from("tour_inclusions").insert(
        input.inclusions.map((i) => ({
          tour_id: id,
          content: i.content,
          content_en: i.contentEn || null,
          display_order: i.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.tips.length > 0) {
      const { error } = await client.from("tour_tips").insert(
        input.tips.map((t) => ({
          tour_id: id,
          content: t.content,
          content_en: t.contentEn || null,
          icon_name: t.iconName,
        })),
      );
      if (error) throw error;
    }

    if (input.dailyPrograms.length > 0) {
      const { error } = await client.from("tour_daily_programs").insert(
        input.dailyPrograms.map((p) => ({
          tour_id: id,
          day_range: p.dayRange,
          title: p.title,
          title_en: p.titleEn || null,
          description: p.description,
          description_en: p.descriptionEn || null,
        })),
      );
      if (error) throw error;
    }

    if (input.datesPrices.length > 0) {
      const { error } = await client.from("tour_dates_prices").insert(
        input.datesPrices.map((d) => ({
          tour_id: id,
          travel_period: d.travelPeriod,
          price_category: d.priceCategory,
          airline: d.airline,
          price: d.price,
          currency: d.currency,
          display_order: d.displayOrder,
        })),
      );
      if (error) throw error;
    }

    if (input.weatherData.length > 0) {
      const { error } = await client.from("tour_weather_data").insert(
        input.weatherData.map((w) => ({
          tour_id: id,
          month: w.month,
          temperature: w.temperature,
          rainfall: w.rainfall,
          is_best_period: w.isBestPeriod,
        })),
      );
      if (error) throw error;
    }

    if (input.groupPrices.length > 0) {
      const { error } = await client.from("tour_group_prices").insert(
        input.groupPrices.map((g) => ({
          tour_id: id,
          row_label: g.rowLabel,
          group_label: g.groupLabel,
          min_pax: g.minPax,
          price: g.price,
          currency: g.currency,
          sort_order: g.sortOrder,
        })),
      );
      if (error) throw error;
    }

    return { id, slug: (tourRow.slug as string) ?? (existing.slug as string) };
  }

  /**
   * Deletes a tour and its child-table rows. Blocked up front — before
   * touching anything — if any `talepler` row references this tour: a
   * quote request pointing at a deleted tour would be unrecoverable, and
   * relying on a possible DB-level FK constraint to surface that as a
   * generic error isn't good enough, so this checks explicitly and throws
   * a sentinel (`TOUR_HAS_REQUESTS`) that `deleteTourAction` turns into a
   * clear Turkish message.
   *
   * Child deletes run explicitly (highlights/inclusions/tips/daily
   * programs/dates-prices/weather/images) instead of relying on the
   * database's own FK cascade rules, since those aren't defined anywhere in
   * this repo and may not be set on every child table — explicit deletes
   * are correct whether or not a DB-level cascade also exists.
   * `tour_group_prices` is the one exception: its migration
   * (`supabase/migrations/0001_tour_group_prices.sql`) defines
   * `tour_id references tours(id) on delete cascade`, so the database
   * removes those rows on its own once this method deletes the `tours` row.
   */
  async deleteTour(id: string): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { count, error: requestCountError } = await client
      .from("talepler")
      .select("id", { count: "exact", head: true })
      .eq("tour_id", id);
    if (requestCountError) throw requestCountError;
    if ((count ?? 0) > 0) {
      throw new Error("TOUR_HAS_REQUESTS");
    }

    const childTables = [
      "tour_highlights",
      "tour_inclusions",
      "tour_tips",
      "tour_daily_programs",
      "tour_dates_prices",
      "tour_weather_data",
      "tour_images",
    ] as const;
    for (const table of childTables) {
      const { error } = await client.from(table).delete().eq("tour_id", id);
      if (error) throw error;
    }

    const { error } = await client.from("tours").delete().eq("id", id);
    if (error) throw error;
  }

  /**
   * Admin panel's own list — must see drafts (`is_published = false`) too,
   * not just what the public site shows. Uses the service-role client
   * rather than the shared anon `supabase` (RLS on `blog_posts` scopes
   * anon SELECT to published rows only, which is why drafts used to
   * silently disappear from this list even though the row existed).
   */
  async listBlogPosts(): Promise<BlogPost[]> {
    const client = await createSupabaseAdminClient();
    const { data, error } = await client
      .from("blog_posts")
      .select(BLOG_POST_COLUMNS)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapBlogPostRow(row as SupabaseBlogPostRow));
  }

  /** Same reasoning as `listBlogPosts` — the admin detail/edit view needs
   * to read a draft post too, which the anon client's RLS would hide. */
  async getBlogPostById(id: string): Promise<BlogPost | null> {
    const client = await createSupabaseAdminClient();
    const { data, error } = await client
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, category_name, hero_image, published_at, read_time, author_name, author_title, author_image, tags, content_sections, is_published, is_featured",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapBlogPostRow(data as SupabaseBlogPostRow);
  }

  /**
   * Builds a blog_posts row (excluding id) from the app-level input.
   * `category_slug` is a NOT NULL column that no read query selects and no
   * form field exposes — confirmed against live TEST data (Adım 0) — so it's
   * derived silently from `categoryName` rather than surfaced to the admin.
   *
   * `published_at` falls back to today when publishing with no date set —
   * the form always pre-fills a date, but this keeps a blank date from
   * reaching `new Date("")` (an Invalid Date, which `.toISOString()`
   * throws on) if that ever stops being true.
   */
  private blogPostPayload(input: BlogPostInput) {
    const publishedAt =
      input.isPublished && !input.publishedAt
        ? new Date().toISOString()
        : new Date(input.publishedAt).toISOString();
    return {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      category_name: input.categoryName,
      category_slug: generateSlug(input.categoryName),
      hero_image: input.heroImagePath,
      published_at: publishedAt,
      read_time: input.readTime,
      author_name: input.authorName,
      author_title: input.authorTitle,
      author_image: input.authorImagePath,
      tags: input.tags.map((name) => ({ name })),
      content_sections: [{ type: "paragraph", content: input.content }],
      is_featured: input.isFeatured,
      is_published: input.isPublished,
    };
  }

  async createBlogPost(input: BlogPostInput): Promise<BlogPost> {
    const client = await createSupabaseAdminClient();

    const { data, error } = await client
      .from("blog_posts")
      .insert(this.blogPostPayload(input))
      .select(BLOG_POST_COLUMNS)
      .single();
    if (error) throw error;

    return mapBlogPostRow(data as SupabaseBlogPostRow);
  }

  /**
   * Updates a blog post's fields by id. When a hero/author image path
   * changed, the previous file is deleted from storage once the row update
   * succeeds — same best-effort cleanup as `updateService`, adapted for
   * the bare-filename, type-scoped-bucket convention (`blogImageBucket()`).
   */
  async updateBlogPost(id: string, input: BlogPostInput): Promise<BlogPost> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("blog_posts")
      .select("hero_image, author_image")
      .eq("id", id)
      .single();
    if (selectError) throw selectError;
    const previous = existing as { hero_image: string | null; author_image: string | null };

    const { data, error } = await client
      .from("blog_posts")
      .update(this.blogPostPayload(input))
      .eq("id", id)
      .select(BLOG_POST_COLUMNS)
      .single();
    if (error) throw error;

    await removeBlogImageIfReplaced(client, "hero", previous.hero_image, input.heroImagePath);
    await removeBlogImageIfReplaced(client, "author", previous.author_image, input.authorImagePath);

    return mapBlogPostRow(data as SupabaseBlogPostRow);
  }

  /** Deletes a blog post and, best-effort, its hero/author image files from storage. */
  async deleteBlogPost(id: string): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("blog_posts")
      .select("hero_image, author_image")
      .eq("id", id)
      .single();
    if (selectError) throw selectError;

    const { error } = await client.from("blog_posts").delete().eq("id", id);
    if (error) throw error;

    const previous = existing as { hero_image: string | null; author_image: string | null };
    const images: { type: BlogImageType; value: string | null }[] = [
      { type: "hero", value: previous.hero_image },
      { type: "author", value: previous.author_image },
    ];
    for (const { type, value } of images) {
      const filename = blogImageFilename(value);
      if (!filename) continue;
      const { error: removeError } = await client.storage.from(blogImageBucket(type)).remove([filename]);
      if (removeError) console.error("[deleteBlogPost] görsel silinemedi:", removeError);
    }
  }

  async updateBlogPostStatus(id: string, isPublished: boolean): Promise<void> {
    const client = await createSupabaseAdminClient();
    const { error } = await client.from("blog_posts").update({ is_published: isPublished }).eq("id", id);
    if (error) throw error;
  }

  async getHomePageOverview(): Promise<HomePageOverview> {
    // logo_settings/hero_settings/featured_section_settings/map_settings
    // have accumulated multiple old rows in the live data (the old panel's
    // "keep it single-row" cleanup didn't always run) — order by
    // most-recently-updated and take the first instead of `.maybeSingle()`,
    // which throws when more than one row matches.
    const [
      { data: logoRows },
      { data: heroRows },
      { data: featuredRows },
      { data: popularTourRows },
      { data: serviceRows },
      { data: mapRows },
      { data: mapLocationRows },
      { data: statRows },
      { data: partnerRows },
    ] = await Promise.all([
      // `nullsFirst: false` matters here: `logo_settings` on the test
      // project has dozens of fully-blank rows (`logo_path` AND
      // `updated_at` both null) left over from old-panel testing, and
      // Postgres' default for `ORDER BY updated_at DESC` sorts nulls
      // *first* — without this override, one of those blank rows would
      // always win over a real, freshly-updated logo row.
      supabase
        .from("logo_settings")
        .select("logo_path")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("hero_settings")
        .select("title, subtitle, image_path")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("featured_section_settings")
        .select("title, subtitle, description, is_active")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("tours")
        .select(
          "id, slug, title, region, duration, base_price, base_price_currency, short_description, long_description, hero_image_path",
        )
        .eq("popular_tour", true),
      supabase
        .from("services")
        .select("id, name, short_description, long_description, icon_svg, image_path, display_order, is_active"),
      supabase
        .from("map_settings")
        .select("title, subtitle, map_image_path")
        .order("updated_at", { ascending: false })
        .limit(1),
      supabase.from("map_locations").select("id, name, description, x_position, y_position, is_active"),
      supabase
        .from("stats")
        .select(
          "id, title, subtitle_first, subtitle_second, stat_value, stat_label, stat_description, stat_icon_svg, display_order, is_active",
        ),
      supabase.from("partners").select("id, name, logo_path, website_url, display_order, is_active"),
    ]);

    const logo = (logoRows?.[0] ?? null) as SupabaseLogoSettingsRow | null;
    const hero = (heroRows?.[0] ?? null) as SupabaseHeroSettingsRow | null;
    const featured = (featuredRows?.[0] ?? null) as SupabaseFeaturedSectionRow | null;
    const mapRow = (mapRows?.[0] ?? null) as SupabaseMapSettingsRow | null;

    return {
      logo: logo
        ? ({ logoUrl: logo.logo_path ? siteImageUrl(logo.logo_path) : null } satisfies HomeLogoSettings)
        : null,
      hero: hero
        ? ({
            title: hero.title ?? "",
            subtitle: hero.subtitle ?? "",
            imageUrl: hero.image_path ? siteImageUrl(hero.image_path) : null,
          } satisfies HomeHeroSettings)
        : null,
      featuredSection: featured
        ? ({
            title: featured.title ?? "",
            subtitle: featured.subtitle ?? "",
            description: featured.description ?? "",
            isActive: featured.is_active ?? false,
          } satisfies FeaturedSectionSettings)
        : null,
      featuredTours: (popularTourRows ?? []).map((row) => mapTourRow(row as SupabaseTourRow)),
      services: (serviceRows ?? []).map((row) => mapService(row as SupabaseServiceRow)).sort(byDisplayOrder),
      map: mapRow
        ? ({
            title: (mapRow as SupabaseMapSettingsRow).title ?? "",
            subtitle: (mapRow as SupabaseMapSettingsRow).subtitle ?? "",
            imageUrl: (mapRow as SupabaseMapSettingsRow).map_image_path
              ? siteImageUrl((mapRow as SupabaseMapSettingsRow).map_image_path)
              : null,
          } satisfies HomeMapSettings)
        : null,
      mapLocations: (mapLocationRows ?? []).map((row) => mapMapLocation(row as SupabaseMapLocationRow)),
      stats: (statRows ?? []).map((row) => mapStat(row as SupabaseStatRow)).sort(byDisplayOrder),
      partners: (partnerRows ?? []).map((row) => mapPartner(row as SupabasePartnerRow)).sort(byDisplayOrder),
    };
  }

  /**
   * Replaces the current logo. `logo_settings` has accumulated multiple old
   * rows in the live data (see the comment in `getHomePageOverview`), so
   * this looks up the most-recently-updated row and updates it in place
   * instead of inserting a new one — that stops the row count from growing
   * further, rather than repeating the old panel's insert-every-time
   * behavior. The previous logo file is deleted from storage only after the
   * new path is safely persisted, and only best-effort — a delete failure
   * is logged but doesn't fail the action, since an orphaned old file is
   * harmless while a broken logo reference isn't.
   */
  async updateHomeLogo(input: UpdateHomeLogoInput): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("logo_settings")
      .select("id, logo_path")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(1);
    if (selectError) throw selectError;

    const current = (existing?.[0] ?? null) as { id: string; logo_path: string | null } | null;

    if (current) {
      const { error } = await client
        .from("logo_settings")
        .update({ logo_path: input.logoPath, updated_at: new Date().toISOString() })
        .eq("id", current.id);
      if (error) throw error;
    } else {
      const { error } = await client
        .from("logo_settings")
        .insert({ logo_path: input.logoPath, updated_at: new Date().toISOString() });
      if (error) throw error;
    }

    if (current?.logo_path && current.logo_path !== input.logoPath) {
      const { error } = await client.storage.from("site-images").remove([current.logo_path]);
      if (error) console.error("[updateHomeLogo] eski logo dosyası silinemedi:", error);
    }
  }

  /**
   * Updates the hero title/subtitle and, optionally, its image — same
   * update-latest-row pattern and best-effort old-file cleanup as
   * `updateHomeLogo`. When no new image was uploaded this time
   * (`input.imagePath` is undefined), the existing `image_path` is kept
   * rather than cleared, so editing just the copy never blanks the banner.
   */
  async updateHomeHero(input: UpdateHomeHeroInput): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("hero_settings")
      .select("id, image_path")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(1);
    if (selectError) throw selectError;

    const current = (existing?.[0] ?? null) as { id: string; image_path: string | null } | null;
    const imagePath = input.imagePath ?? current?.image_path ?? null;

    if (current) {
      const { error } = await client
        .from("hero_settings")
        .update({
          title: input.title,
          subtitle: input.subtitle,
          image_path: imagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", current.id);
      if (error) throw error;
    } else {
      const { error } = await client.from("hero_settings").insert({
        title: input.title,
        subtitle: input.subtitle,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    if (input.imagePath && current?.image_path && current.image_path !== input.imagePath) {
      const { error } = await client.storage.from("site-images").remove([current.image_path]);
      if (error) console.error("[updateHomeHero] eski hero görseli silinemedi:", error);
    }
  }

  /**
   * Adds a new partner at the end of the current display order (highest
   * existing `display_order` + 1). Ordering/active-state edits for existing
   * partners aren't part of this method — only creation is.
   */
  async createPartner(input: CreatePartnerInput): Promise<Partner> {
    const client = await createSupabaseAdminClient();

    const { data: maxRows, error: maxError } = await client
      .from("partners")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    if (maxError) throw maxError;

    const nextDisplayOrder = ((maxRows?.[0]?.display_order as number | null) ?? 0) + 1;

    const { data, error } = await client
      .from("partners")
      .insert({
        name: input.name,
        website_url: input.websiteUrl || null,
        logo_path: input.logoPath,
        display_order: nextDisplayOrder,
        is_active: true,
      })
      .select("id, name, logo_path, website_url, display_order, is_active")
      .single();
    if (error) throw error;

    return mapPartner(data as SupabasePartnerRow);
  }

  /**
   * Updates the featured-tours section copy (title/subtitle/description) —
   * same update-latest-row-or-insert pattern as `updateHomeLogo`/
   * `updateHomeHero`. Always writes `is_active: true`: this repository only
   * ever maintains one current row per singleton setting, so there's no
   * second row to deactivate the way the old panel's multi-row scheme did.
   */
  async updateFeaturedSection(input: UpdateFeaturedSectionInput): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("featured_section_settings")
      .select("id")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(1);
    if (selectError) throw selectError;

    const current = (existing?.[0] ?? null) as { id: string } | null;
    const payload = {
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (current) {
      const { error } = await client.from("featured_section_settings").update(payload).eq("id", current.id);
      if (error) throw error;
    } else {
      const { error } = await client.from("featured_section_settings").insert(payload);
      if (error) throw error;
    }
  }

  /**
   * Marks a tour as popular (shown in the home page's featured section) or
   * clears that flag. The home page only has room for a handful of featured
   * tours, so turning the flag on is capped at `MAX_POPULAR_TOURS` — callers
   * distinguish that case by checking `error.message`.
   */
  async setTourPopular(tourId: string, isPopular: boolean): Promise<void> {
    const client = await createSupabaseAdminClient();

    if (isPopular) {
      const { count, error: countError } = await client
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("popular_tour", true);
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_POPULAR_TOURS) {
        throw new Error("MAX_POPULAR_TOURS");
      }
    }

    const { error } = await client.from("tours").update({ popular_tour: isPopular }).eq("id", tourId);
    if (error) throw error;
  }

  /**
   * Creates a service card at the end of the current display order (highest
   * existing `display_order` + 1) — same pattern as `createPartner`.
   */
  async createService(input: ServiceInput): Promise<SiteService> {
    const client = await createSupabaseAdminClient();

    const { data: maxRows, error: maxError } = await client
      .from("services")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    if (maxError) throw maxError;

    const nextDisplayOrder = ((maxRows?.[0]?.display_order as number | null) ?? 0) + 1;

    const { data, error } = await client
      .from("services")
      .insert({
        name: input.name,
        short_description: input.shortDescription,
        long_description: input.longDescription,
        icon_svg: input.iconSvg,
        image_path: input.imagePath || null,
        display_order: nextDisplayOrder,
        is_active: true,
      })
      .select("id, name, short_description, long_description, icon_svg, image_path, display_order, is_active")
      .single();
    if (error) throw error;

    return mapService(data as SupabaseServiceRow);
  }

  /**
   * Updates a service's fields by id. When a new image was uploaded
   * (`input.imagePath` set), the previous image file is deleted from
   * storage once the row update succeeds — same best-effort cleanup as
   * `updateHomeLogo`.
   */
  async updateService(id: string, input: ServiceInput): Promise<SiteService> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("services")
      .select("image_path")
      .eq("id", id)
      .single();
    if (selectError) throw selectError;
    const previousImagePath = (existing as { image_path: string | null } | null)?.image_path ?? null;
    const imagePath = input.imagePath || previousImagePath;

    const { data, error } = await client
      .from("services")
      .update({
        name: input.name,
        short_description: input.shortDescription,
        long_description: input.longDescription,
        icon_svg: input.iconSvg,
        image_path: imagePath,
      })
      .eq("id", id)
      .select("id, name, short_description, long_description, icon_svg, image_path, display_order, is_active")
      .single();
    if (error) throw error;

    if (input.imagePath && previousImagePath && previousImagePath !== input.imagePath) {
      const { error: removeError } = await client.storage.from("site-images").remove([previousImagePath]);
      if (removeError) console.error("[updateService] eski görsel silinemedi:", removeError);
    }

    return mapService(data as SupabaseServiceRow);
  }

  /** Deletes a service and, best-effort, its image file from storage. */
  async deleteService(id: string): Promise<void> {
    const client = await createSupabaseAdminClient();

    const { data: existing, error: selectError } = await client
      .from("services")
      .select("image_path")
      .eq("id", id)
      .single();
    if (selectError) throw selectError;

    const { error } = await client.from("services").delete().eq("id", id);
    if (error) throw error;

    const imagePath = (existing as { image_path: string | null } | null)?.image_path;
    if (imagePath) {
      const { error: removeError } = await client.storage.from("site-images").remove([imagePath]);
      if (removeError) console.error("[deleteService] görsel silinemedi:", removeError);
    }
  }

  async updateServiceStatus(id: string, isActive: boolean): Promise<void> {
    const client = await createSupabaseAdminClient();
    const { error } = await client.from("services").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  }

  /**
   * Creates a stat card, capped at `MAX_STATS`. `title`/`subtitle_first`/
   * `subtitle_second` aren't exposed in the stat form (they're a duplicated
   * section heading, not per-stat content — confirmed against live data,
   * every existing row carries the same three values), so a new row copies
   * them from any existing stat, falling back to the old panel's original
   * defaults when there are no stats yet.
   */
  async createStat(input: StatInput): Promise<SiteStat> {
    const client = await createSupabaseAdminClient();

    const { data: existingRows, error: existingError } = await client
      .from("stats")
      .select("title, subtitle_first, subtitle_second, display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    if (existingError) throw existingError;

    const existing = (existingRows?.[0] ?? null) as {
      title: string | null;
      subtitle_first: string | null;
      subtitle_second: string | null;
      display_order: number | null;
    } | null;

    const { count, error: countError } = await client.from("stats").select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_STATS) {
      throw new Error("MAX_STATS");
    }

    const { data, error } = await client
      .from("stats")
      .insert({
        title: existing?.title ?? "RAKAMLARLA BİZ",
        subtitle_first: existing?.subtitle_first ?? "Seyahatin",
        subtitle_second: existing?.subtitle_second ?? "Geleceğini Şekillendiriyoruz",
        stat_value: input.value,
        stat_label: input.label,
        stat_description: input.description,
        stat_icon_svg: input.iconSvg,
        display_order: (existing?.display_order ?? 0) + 1,
        is_active: true,
      })
      .select(
        "id, title, subtitle_first, subtitle_second, stat_value, stat_label, stat_description, stat_icon_svg, display_order, is_active",
      )
      .single();
    if (error) throw error;

    return mapStat(data as SupabaseStatRow);
  }

  async updateStat(id: string, input: StatInput): Promise<SiteStat> {
    const client = await createSupabaseAdminClient();

    const { data, error } = await client
      .from("stats")
      .update({
        stat_value: input.value,
        stat_label: input.label,
        stat_description: input.description,
        stat_icon_svg: input.iconSvg,
      })
      .eq("id", id)
      .select(
        "id, title, subtitle_first, subtitle_second, stat_value, stat_label, stat_description, stat_icon_svg, display_order, is_active",
      )
      .single();
    if (error) throw error;

    return mapStat(data as SupabaseStatRow);
  }

  async deleteStat(id: string): Promise<void> {
    const client = await createSupabaseAdminClient();
    const { error } = await client.from("stats").delete().eq("id", id);
    if (error) throw error;
  }

  async listRequests(filters?: RequestFilters): Promise<TeklifTalebi[]> {
    const client = await createSupabaseServerClient();
    let query = client
      .from("talepler")
      .select(REQUEST_COLUMNS)
      .order("created_at", { ascending: false });

    if (filters?.agencyId) query = query.eq("agency_id", filters.agencyId);
    if (filters?.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw error;

    let results = await enrichRequestRows(client, (data ?? []) as SupabaseRequestRow[]);

    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (request) =>
          request.id.toLowerCase().includes(term) ||
          request.tourName.toLowerCase().includes(term) ||
          request.agencyName.toLowerCase().includes(term),
      );
    }

    return results;
  }

  async getRequestById(id: string): Promise<TeklifTalebi | null> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("talepler")
      .select(REQUEST_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const [mapped] = await enrichRequestRows(client, [data as SupabaseRequestRow]);
    return mapped ?? null;
  }

  async createRequest(input: CreateRequestInput): Promise<TeklifTalebi> {
    const client = await createSupabaseServerClient();

    const { data: tourRow, error: tourError } = await client
      .from("tours")
      .select("id, title, hero_image_path, base_price, base_price_currency")
      .eq("id", input.tourId)
      .maybeSingle();
    if (tourError) throw tourError;
    if (!tourRow) throw new Error(`Tour not found: ${input.tourId}`);

    const { data: agencyRow, error: agencyError } = await client
      .from("acentalar")
      .select("id, acenta_ismi")
      .eq("id", input.agencyId)
      .maybeSingle();
    if (agencyError) throw agencyError;
    if (!agencyRow) throw new Error(`Agency not found: ${input.agencyId}`);

    const currency = (
      CURRENCIES.has(tourRow.base_price_currency ?? "") ? tourRow.base_price_currency : "TRY"
    ) as TeklifTalebi["currency"];
    const amount = (tourRow.base_price ?? 0) * (input.adults + input.children);

    const { data, error } = await client
      .from("talepler")
      .insert({
        tour_id: input.tourId,
        agency_id: input.agencyId,
        adults: input.adults,
        children: input.children,
        start_date: input.startDate,
        nights: input.nights,
        amount,
        currency,
        notes: input.notes,
      })
      .select(REQUEST_COLUMNS)
      .single();
    if (error) throw error;

    return mapRequestRow(
      data as SupabaseRequestRow,
      { title: tourRow.title, hero_image_path: tourRow.hero_image_path },
      agencyRow.acenta_ismi,
    );
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<TeklifTalebi> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("talepler")
      .update({ status, status_changed_at: new Date().toISOString() })
      .eq("id", id)
      .select(REQUEST_COLUMNS)
      .single();
    if (error) throw error;

    const [mapped] = await enrichRequestRows(client, [data as SupabaseRequestRow]);
    if (!mapped) throw new Error(`Request not found: ${id}`);
    return mapped;
  }

  async listAgencies(filters?: AgencyFilters): Promise<Agency[]> {
    const client = await createSupabaseServerClient();
    let query = client
      .from("acentalar")
      .select(AGENCY_COLUMNS)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapAgencyRow(row as AcentalarRow));
  }

  async getAgencyById(id: string): Promise<Agency | null> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("acentalar")
      .select(AGENCY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAgencyRow(data as AcentalarRow) : null;
  }

  async updateAgencyStatus(id: string, status: AgencyStatus): Promise<Agency> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("acentalar")
      .update({ status })
      .eq("id", id)
      .select(AGENCY_COLUMNS)
      .single();
    if (error) throw error;
    return mapAgencyRow(data as AcentalarRow);
  }

  /**
   * Toggles whether an agency can see `tour_group_prices` rows. Unlike
   * `updateAgencyStatus`/`updateAgencyProfile` (which stay on the caller's
   * own RLS-scoped session), this uses the service-role client: it's a
   * brand-new write path and the admin-only check belongs in the calling
   * Server Action (`updateAgencyCanViewPricesAction`), not in an RLS policy
   * on `acentalar`.
   */
  async updateAgencyCanViewPrices(id: string, canViewPrices: boolean): Promise<Agency> {
    const client = await createSupabaseAdminClient();
    const { data, error } = await client
      .from("acentalar")
      .update({ can_view_prices: canViewPrices })
      .eq("id", id)
      .select(AGENCY_COLUMNS)
      .single();
    if (error) throw error;
    return mapAgencyRow(data as AcentalarRow);
  }

  async updateAgencyProfile(id: string, input: AgencyProfileInput): Promise<Agency> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("acentalar")
      .update({
        acenta_ismi: input.acentaIsmi,
        isim: input.firstName,
        soyisim: input.lastName,
        email: input.email,
        telefon: input.phone,
      })
      .eq("id", id)
      .select(AGENCY_COLUMNS)
      .single();
    if (error) throw error;
    return mapAgencyRow(data as AcentalarRow);
  }

  async getApprovedRevenueByCurrency(
    filters?: RequestFilters,
  ): Promise<{ currency: Currency; amount: number }[]> {
    const client = await createSupabaseServerClient();
    const revenueRows = await fetchApprovedRevenueRows(client, filters);
    return revenueRowsByCurrency(revenueRows);
  }

  async getDashboardStats(
    requests: TeklifTalebi[],
    filters?: RequestFilters,
    revenueByCurrency?: { currency: Currency; amount: number }[],
  ): Promise<DashboardStats> {
    const scoped = requests;
    const resolvedRevenueByCurrency =
      revenueByCurrency ?? (await this.getApprovedRevenueByCurrency(filters));
    return {
      totalRequests: scoped.length,
      pendingRequests: scoped.filter((r) => r.status === "beklemede").length,
      approvedTours: scoped.filter((r) => r.status === "onaylandi").length,
      revisionRequests: scoped.filter((r) => r.status === "revize_istendi").length,
      revenueByCurrency: resolvedRevenueByCurrency,
    };
  }
}
