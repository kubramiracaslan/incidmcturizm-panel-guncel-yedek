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

/**
 * Single contract every screen talks to for tours, requests and agencies.
 *
 * Today `MockDataRepository` (mock-repository.ts) is the only
 * implementation, backed by static in-memory arrays. When the site's
 * developer hands over the production database, implement this same
 * interface against that API/DB (e.g. `ApiDataRepository`) and swap the
 * export in `lib/data/index.ts` — no page or component needs to change.
 */
export interface DataRepository {
  listTours(filters?: TourFilters): Promise<Tour[]>;
  getTourById(id: string): Promise<Tour | null>;
  createTour(input: CreateTourInput): Promise<{ id: string; slug: string }>;

  listBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: string): Promise<BlogPost | null>;

  getHomePageOverview(): Promise<HomePageOverview>;
  updateHomeLogo(input: UpdateHomeLogoInput): Promise<void>;
  updateHomeHero(input: UpdateHomeHeroInput): Promise<void>;
  createPartner(input: CreatePartnerInput): Promise<Partner>;

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
