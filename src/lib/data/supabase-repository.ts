import type {
  Agency,
  AgencyFilters,
  AgencyStatus,
  BlogPost,
  CreateRequestInput,
  CreateTourInput,
  DashboardStats,
  FeaturedSectionSettings,
  HomeHeroSettings,
  HomeLogoSettings,
  HomeMapSettings,
  HomePageOverview,
  MapLocation,
  Partner,
  RequestFilters,
  RequestStatus,
  SiteService,
  SiteStat,
  TeklifTalebi,
  Tour,
  TourFilters,
} from "@/lib/types";
import type {
  CreatePartnerInput,
  DataRepository,
  ServiceInput,
  StatInput,
  UpdateFeaturedSectionInput,
  UpdateHomeHeroInput,
  UpdateHomeLogoInput,
} from "./repository";
import { MockDataRepository } from "./mock-repository";
import { supabase, siteImageUrl, tourImageUrl, blogImageUrl } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgencyProfileInput } from "@/lib/validation/agency";

const AGENCY_COLUMNS = "id, acenta_ismi, isim, soyisim, email, telefon, status";

interface AcentalarRow {
  id: string;
  acenta_ismi: string | null;
  isim: string | null;
  soyisim: string | null;
  email: string | null;
  telefon: string | null;
  status: string | null;
}

function mapAgencyRow(row: AcentalarRow): Agency {
  return {
    id: row.id,
    name: row.acenta_ismi ?? "",
    contactName: [row.isim, row.soyisim].filter(Boolean).join(" "),
    firstName: row.isim ?? "",
    lastName: row.soyisim ?? "",
    email: row.email ?? "",
    phone: row.telefon ?? "",
    status: (row.status as AgencyStatus) ?? "pending",
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
    excludes: [],
    importantNotes: (extra?.notes ?? []).slice().sort(byOrder).map((n) => n.content),
    isPopular: row.popular_tour ?? false,
  };
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
    heroImage: blogImageUrl(row.hero_image),
    publishedAt: row.published_at ?? "",
    readTime: row.read_time ?? 0,
    authorName: row.author_name ?? "",
    authorTitle: row.author_title ?? "",
    authorImage: row.author_image ? blogImageUrl(row.author_image) : null,
    tags: (row.tags ?? []).map((t) => t.name),
    contentHtml: (row.content_sections ?? []).map((s) => s.content).join("\n"),
    isPublished: row.is_published ?? false,
    isFeatured: row.is_featured ?? false,
  };
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
 * Reads from the site's existing (adminpanel3) Supabase project. Only the
 * tables that project already has are touched, and only via SELECT — no
 * writes. Concepts this panel has of its own (agencies, quote requests) have
 * no counterpart in that schema, so those methods delegate to the in-memory
 * mock repository unchanged.
 */
export class SupabaseDataRepository implements DataRepository {
  private mock = new MockDataRepository();

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
    if (filters?.search) {
      const term = filters.search.trim();
      if (term) {
        query = query.or(`title.ilike.%${term}%,region.ilike.%${term}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapTourRow(row as SupabaseTourRow));
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

    const [{ data: highlights }, { data: includes }, { data: tips }] = await Promise.all([
      supabase.from("tour_highlights").select("content, display_order").eq("tour_id", id),
      supabase.from("tour_inclusions").select("content, display_order").eq("tour_id", id),
      supabase.from("tour_tips").select("content, display_order").eq("tour_id", id),
    ]);

    return mapTourRow(tourRow as SupabaseTourRow, {
      highlights: (highlights ?? []) as SupabaseTourContentRow[],
      includes: (includes ?? []) as SupabaseTourContentRow[],
      notes: (tips ?? []) as SupabaseTourContentRow[],
    });
  }

  /**
   * Writes a new tour and all of its child-table content in one go. Uses
   * the authenticated (admin) server client — unlike most other methods on
   * this class, which only ever read via the shared anon client — because
   * this is a write path into the site's own `tours` schema.
   */
  async createTour(input: CreateTourInput): Promise<{ id: string; slug: string }> {
    const client = await createSupabaseServerClient();

    const { data: tourRow, error: tourError } = await client
      .from("tours")
      .insert({
        title: input.title,
        title_en: input.titleEn || null,
        slug: input.slug,
        region: input.region,
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

    return { id: tourId, slug: tourRow.slug as string };
  }

  async listBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, category_name, hero_image, published_at, read_time, author_name, author_title, author_image, tags, is_published, is_featured",
      )
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapBlogPostRow({ ...row, content_sections: [] } as SupabaseBlogPostRow));
  }

  async getBlogPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();
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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();

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
    const client = await createSupabaseServerClient();
    const { error } = await client.from("stats").delete().eq("id", id);
    if (error) throw error;
  }

  listRequests(filters?: RequestFilters): Promise<TeklifTalebi[]> {
    return this.mock.listRequests(filters);
  }

  getRequestById(id: string): Promise<TeklifTalebi | null> {
    return this.mock.getRequestById(id);
  }

  createRequest(input: CreateRequestInput): Promise<TeklifTalebi> {
    return this.mock.createRequest(input);
  }

  updateRequestStatus(id: string, status: RequestStatus): Promise<TeklifTalebi> {
    return this.mock.updateRequestStatus(id, status);
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

  getDashboardStats(filters?: RequestFilters): Promise<DashboardStats> {
    return this.mock.getDashboardStats(filters);
  }
}
