import type {
  Agency,
  BlogPost,
  CreateAgencyInput,
  CreateRequestInput,
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
import type { DataRepository } from "./repository";
import { MockDataRepository } from "./mock-repository";
import { supabase, siteImageUrl, blogImageUrl } from "@/lib/supabase/client";

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

const CURRENCIES = new Set(["TRY", "USD", "EUR"]);

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
    coverImage: siteImageUrl(row.hero_image_path),
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
        "id, slug, title, region, duration, base_price, base_price_currency, short_description, long_description, hero_image_path",
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
      supabase.from("logo_settings").select("logo_path").order("updated_at", { ascending: false }).limit(1),
      supabase
        .from("hero_settings")
        .select("title, subtitle, image_path")
        .order("updated_at", { ascending: false })
        .limit(1),
      supabase
        .from("featured_section_settings")
        .select("title, subtitle, description, is_active")
        .order("updated_at", { ascending: false })
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

  listAgencies(): Promise<Agency[]> {
    return this.mock.listAgencies();
  }

  getAgencyById(id: string): Promise<Agency | null> {
    return this.mock.getAgencyById(id);
  }

  createAgency(input: CreateAgencyInput): Promise<Agency> {
    return this.mock.createAgency(input);
  }

  getDashboardStats(filters?: RequestFilters): Promise<DashboardStats> {
    return this.mock.getDashboardStats(filters);
  }
}
