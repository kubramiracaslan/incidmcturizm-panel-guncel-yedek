import type {
  Agency,
  AgencyFilters,
  AgencyStatus,
  BlogPost,
  CreateRequestInput,
  CreateTourInput,
  DashboardStats,
  HomePageOverview,
  Partner,
  RequestFilters,
  RequestStatus,
  SiteService,
  SiteStat,
  TeklifTalebi,
  Tour,
  TourFilters,
} from "@/lib/types";
import type { AgencyProfileInput } from "@/lib/validation/agency";

export interface UpdateHomeLogoInput {
  logoPath: string;
}

export interface UpdateHomeHeroInput {
  title: string;
  subtitle: string;
  imagePath?: string;
}

export interface CreatePartnerInput {
  name: string;
  websiteUrl: string;
  logoPath: string;
}

export interface UpdateFeaturedSectionInput {
  title: string;
  subtitle: string;
  description: string;
}

export interface ServiceInput {
  name: string;
  shortDescription: string;
  longDescription: string;
  iconSvg: string;
  imagePath?: string;
}

export interface StatInput {
  value: number;
  label: string;
  description: string;
  iconSvg: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  heroImagePath: string;
  publishedAt: string;
  readTime: number;
  authorName: string;
  authorTitle: string;
  authorImagePath: string;
  tags: string[];
  content: string;
  isFeatured: boolean;
}

/**
 * Single contract every screen talks to for tours, requests and agencies.
 *
 * `SupabaseDataRepository` (supabase-repository.ts) is the only
 * implementation, wired up in `lib/data/index.ts`. A new backend would
 * implement this same interface and swap that export — no page or
 * component needs to change.
 */
export interface DataRepository {
  listTours(filters?: TourFilters): Promise<Tour[]>;
  getTourById(id: string): Promise<Tour | null>;
  createTour(input: CreateTourInput): Promise<{ id: string; slug: string }>;

  listBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: string): Promise<BlogPost | null>;
  createBlogPost(input: BlogPostInput): Promise<BlogPost>;
  updateBlogPost(id: string, input: BlogPostInput): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  updateBlogPostStatus(id: string, isPublished: boolean): Promise<void>;

  getHomePageOverview(): Promise<HomePageOverview>;
  updateHomeLogo(input: UpdateHomeLogoInput): Promise<void>;
  updateHomeHero(input: UpdateHomeHeroInput): Promise<void>;
  createPartner(input: CreatePartnerInput): Promise<Partner>;
  updateFeaturedSection(input: UpdateFeaturedSectionInput): Promise<void>;
  setTourPopular(tourId: string, isPopular: boolean): Promise<void>;
  createService(input: ServiceInput): Promise<SiteService>;
  updateService(id: string, input: ServiceInput): Promise<SiteService>;
  deleteService(id: string): Promise<void>;
  updateServiceStatus(id: string, isActive: boolean): Promise<void>;
  createStat(input: StatInput): Promise<SiteStat>;
  updateStat(id: string, input: StatInput): Promise<SiteStat>;
  deleteStat(id: string): Promise<void>;

  listRequests(filters?: RequestFilters): Promise<TeklifTalebi[]>;
  getRequestById(id: string): Promise<TeklifTalebi | null>;
  createRequest(input: CreateRequestInput): Promise<TeklifTalebi>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<TeklifTalebi>;

  listAgencies(filters?: AgencyFilters): Promise<Agency[]>;
  getAgencyById(id: string): Promise<Agency | null>;
  updateAgencyStatus(id: string, status: AgencyStatus): Promise<Agency>;
  updateAgencyProfile(id: string, input: AgencyProfileInput): Promise<Agency>;

  getDashboardStats(filters?: RequestFilters): Promise<DashboardStats>;
}
