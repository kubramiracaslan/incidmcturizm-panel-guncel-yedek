/**
 * Domain types shared by the mock data layer today and the real
 * database-backed layer once the site developer hands over the
 * production backend. Pages and components depend only on these types
 * and on the `DataRepository` interface (see `lib/data/repository.ts`),
 * never on the mock data shape directly — that is what lets the data
 * source be swapped later without touching UI code.
 */

export type Currency = "TRY" | "USD" | "EUR";

export type UserRole = "agent" | "admin";

export interface TourHighlight {
  icon: string; // Material Symbols icon name
  title: string;
  subtitle: string;
}

export interface Tour {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  coverImage: string;
  nights: number;
  days: number;
  startingPrice: number;
  currency: Currency;
  capacity: number;
  themes: string[];
  highlights: TourHighlight[];
  includes: string[];
  excludes: string[];
  importantNotes: string[];
}

export type RequestStatus =
  | "beklemede"
  | "onaylandi"
  | "revize_istendi"
  | "reddedildi";

export interface TeklifTalebi {
  id: string; // e.g. "TLP-8492"
  tourId: string;
  tourName: string;
  tourImage: string | null;
  agencyId: string;
  agencyName: string;
  adults: number;
  children: number;
  startDate: string; // ISO date
  nights: number;
  amount: number;
  currency: Currency;
  status: RequestStatus;
  notes: string;
  createdAt: string; // ISO datetime
}

export interface CreateRequestInput {
  tourId: string;
  agencyId: string;
  adults: number;
  children: number;
  startDate: string;
  nights: number;
  notes: string;
}

export interface Agency {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: "active" | "passive";
}

export interface CreateAgencyInput {
  name: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string | null;
  agencyName: string | null;
  avatarUrl: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedTours: number;
  revisionRequests: number;
}

export interface RequestFilters {
  agencyId?: string;
  status?: RequestStatus;
  search?: string;
}

export interface TourFilters {
  region?: string;
  search?: string;
}
