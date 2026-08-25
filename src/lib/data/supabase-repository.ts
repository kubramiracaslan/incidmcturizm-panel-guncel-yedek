import type {
  Agency,
  BlogPost,
  CreateAgencyInput,
  CreateRequestInput,
  DashboardStats,
  RequestFilters,
  RequestStatus,
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
