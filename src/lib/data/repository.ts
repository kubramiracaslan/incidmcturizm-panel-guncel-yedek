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

  listBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: string): Promise<BlogPost | null>;

  listRequests(filters?: RequestFilters): Promise<TeklifTalebi[]>;
  getRequestById(id: string): Promise<TeklifTalebi | null>;
  createRequest(input: CreateRequestInput): Promise<TeklifTalebi>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<TeklifTalebi>;

  listAgencies(): Promise<Agency[]>;
  getAgencyById(id: string): Promise<Agency | null>;
  createAgency(input: CreateAgencyInput): Promise<Agency>;

  getDashboardStats(filters?: RequestFilters): Promise<DashboardStats>;
}
