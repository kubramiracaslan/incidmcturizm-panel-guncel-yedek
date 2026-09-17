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
  capacity?: number;
  themes: string[];
  highlights: TourHighlight[];
  includes: string[];
  excludes: string[];
  importantNotes: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  heroImage: string;
  publishedAt: string; // ISO datetime
  readTime: number;
  authorName: string;
  authorTitle: string;
  authorImage: string | null;
  tags: string[];
  contentHtml: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export interface HomeLogoSettings {
  logoUrl: string | null;
}

export interface HomeHeroSettings {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}

export interface FeaturedSectionSettings {
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
}

export interface SiteService {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  iconSvg: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface HomeMapSettings {
  title: string;
  subtitle: string;
  imageUrl: string | null;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  xPosition: number;
  yPosition: number;
  isActive: boolean;
}

export interface SiteStat {
  id: string;
  title: string;
  subtitleFirst: string;
  subtitleSecond: string;
  value: number;
  label: string;
  description: string;
  iconSvg: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HomePageOverview {
  logo: HomeLogoSettings | null;
  hero: HomeHeroSettings | null;
  featuredSection: FeaturedSectionSettings | null;
  featuredTours: Tour[];
  services: SiteService[];
  map: HomeMapSettings | null;
  mapLocations: MapLocation[];
  stats: SiteStat[];
  partners: Partner[];
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

export type AgencyStatus = "pending" | "approved" | "rejected";

export interface Agency {
  id: string;
  name: string;
  contactName: string;
  /** Raw `isim` — kept separate from `contactName` because that joined
   * display string can't be reliably split back apart for editing. */
  firstName: string;
  /** Raw `soyisim` — see `firstName`. */
  lastName: string;
  email: string;
  phone: string;
  status: AgencyStatus;
}

export interface AgencyFilters {
  status?: AgencyStatus;
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
