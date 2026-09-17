import type {
  Agency,
  AgencyFilters,
  AgencyStatus,
  BlogPost,
  CreateRequestInput,
  DashboardStats,
  HomePageOverview,
  RequestFilters,
  RequestStatus,
  TeklifTalebi,
  Tour,
  TourFilters,
} from "@/lib/types";
import type { DataRepository } from "./repository";
import type { AgencyProfileInput } from "@/lib/validation/agency";
import { mockAgencies } from "./mock/agencies";
import { mockRequests, findMockRequestById } from "./mock/requests";
import { mockTours, findMockTourById } from "./mock/tours";

let requests = [...mockRequests];
let requestSequence = 8500;

function nextRequestId(): string {
  requestSequence += 1;
  return `TLP-${requestSequence}`;
}

let agencies = [...mockAgencies];

function findAgencyById(id: string): Agency | undefined {
  return agencies.find((agency) => agency.id === id);
}

export class MockDataRepository implements DataRepository {
  async listTours(filters?: TourFilters): Promise<Tour[]> {
    let results = [...mockTours];
    if (filters?.region) {
      results = results.filter((tour) => tour.region === filters.region);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (tour) =>
          tour.name.toLowerCase().includes(term) ||
          tour.region.toLowerCase().includes(term),
      );
    }
    return results;
  }

  async getTourById(id: string): Promise<Tour | null> {
    return findMockTourById(id) ?? null;
  }

  async listBlogPosts(): Promise<BlogPost[]> {
    return [];
  }

  async getBlogPostById(): Promise<BlogPost | null> {
    return null;
  }

  async getHomePageOverview(): Promise<HomePageOverview> {
    return {
      logo: null,
      hero: null,
      featuredSection: null,
      featuredTours: [],
      services: [],
      map: null,
      mapLocations: [],
      stats: [],
      partners: [],
    };
  }

  async listRequests(filters?: RequestFilters): Promise<TeklifTalebi[]> {
    let results = [...requests];
    if (filters?.agencyId) {
      results = results.filter((request) => request.agencyId === filters.agencyId);
    }
    if (filters?.status) {
      results = results.filter((request) => request.status === filters.status);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (request) =>
          request.id.toLowerCase().includes(term) ||
          request.tourName.toLowerCase().includes(term) ||
          request.agencyName.toLowerCase().includes(term),
      );
    }
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async getRequestById(id: string): Promise<TeklifTalebi | null> {
    return requests.find((request) => request.id === id) ?? findMockRequestById(id) ?? null;
  }

  async createRequest(input: CreateRequestInput): Promise<TeklifTalebi> {
    const tour = findMockTourById(input.tourId);
    const agency = findAgencyById(input.agencyId);
    if (!tour) throw new Error(`Tour not found: ${input.tourId}`);
    if (!agency) throw new Error(`Agency not found: ${input.agencyId}`);

    const created: TeklifTalebi = {
      id: nextRequestId(),
      tourId: tour.id,
      tourName: tour.name,
      tourImage: tour.coverImage,
      agencyId: agency.id,
      agencyName: agency.name,
      adults: input.adults,
      children: input.children,
      startDate: input.startDate,
      nights: input.nights,
      amount: tour.startingPrice * (input.adults + input.children),
      currency: tour.currency,
      status: "beklemede",
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    requests = [created, ...requests];
    return created;
  }

  async updateRequestStatus(id: string, status: RequestStatus): Promise<TeklifTalebi> {
    const existing = requests.find((request) => request.id === id);
    if (!existing) throw new Error(`Request not found: ${id}`);
    const updated: TeklifTalebi = { ...existing, status };
    requests = requests.map((request) => (request.id === id ? updated : request));
    return updated;
  }

  async listAgencies(filters?: AgencyFilters): Promise<Agency[]> {
    if (filters?.status) {
      return agencies.filter((agency) => agency.status === filters.status);
    }
    return [...agencies];
  }

  async getAgencyById(id: string): Promise<Agency | null> {
    return findAgencyById(id) ?? null;
  }

  async updateAgencyStatus(id: string, status: AgencyStatus): Promise<Agency> {
    const existing = findAgencyById(id);
    if (!existing) throw new Error(`Agency not found: ${id}`);
    const updated: Agency = { ...existing, status };
    agencies = agencies.map((agency) => (agency.id === id ? updated : agency));
    return updated;
  }

  async updateAgencyProfile(id: string, input: AgencyProfileInput): Promise<Agency> {
    const existing = findAgencyById(id);
    if (!existing) throw new Error(`Agency not found: ${id}`);
    const updated: Agency = {
      ...existing,
      name: input.acentaIsmi,
      firstName: input.firstName,
      lastName: input.lastName,
      contactName: `${input.firstName} ${input.lastName}`.trim(),
      email: input.email,
      phone: input.phone,
    };
    agencies = agencies.map((agency) => (agency.id === id ? updated : agency));
    return updated;
  }

  async getDashboardStats(filters?: RequestFilters): Promise<DashboardStats> {
    const scoped = await this.listRequests(filters);
    return {
      totalRequests: scoped.length,
      pendingRequests: scoped.filter((r) => r.status === "beklemede").length,
      approvedTours: scoped.filter((r) => r.status === "onaylandi").length,
      revisionRequests: scoped.filter((r) => r.status === "revize_istendi").length,
    };
  }
}
