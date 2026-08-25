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
let agencySequence = 0;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nextAgencyId(name: string): string {
  agencySequence += 1;
  const base = slugify(name) || "acente";
  return `agency-${base}-${agencySequence}`;
}

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

  async listAgencies(): Promise<Agency[]> {
    return [...agencies];
  }

  async getAgencyById(id: string): Promise<Agency | null> {
    return findAgencyById(id) ?? null;
  }

  async createAgency(input: CreateAgencyInput): Promise<Agency> {
    const created: Agency = {
      id: nextAgencyId(input.name),
      name: input.name,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      status: "active",
    };
    agencies = [created, ...agencies];
    return created;
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
