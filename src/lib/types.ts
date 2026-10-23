/** DataRepository (lib/data/repository.ts) arayüzünün kullandığı alan tipleri. */

export type Currency = "TRY" | "USD" | "EUR" | "GBP";

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
  isPopular: boolean;
}

export interface CreateTourHighlightInput {
  content: string;
  contentEn?: string;
  displayOrder: number;
}

export interface CreateTourInclusionInput {
  content: string;
  contentEn?: string;
  displayOrder: number;
}

export interface CreateTourTipInput {
  content: string;
  contentEn?: string;
  iconName: string;
}

export interface CreateTourDailyProgramInput {
  dayRange: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface CreateTourDatePriceInput {
  travelPeriod: string;
  priceCategory: string;
  airline: string;
  price: number;
  currency: Currency;
  displayOrder: number;
}

export interface CreateTourWeatherDataInput {
  month: string;
  temperature: number;
  rainfall: number;
  isBestPeriod: boolean;
}

/**
 * Write-side shape for the "Yeni Tur Ekle" form — deliberately separate
 * from `Tour` (the read-side shape the catalog/detail pages already use)
 * because it models every real `tours` column the live site reads,
 * including ones `Tour` doesn't surface (base_date_start/end, the three
 * flat gallery image columns, popular_tour/destination_status/opportunity_tour).
 * `tour_type_id` is intentionally excluded — confirmed unused on the live
 * site. `_en` fields are optional and may be left blank for now.
 */
export interface CreateTourInput {
  title: string;
  titleEn?: string;
  slug: string;
  region: string;
  duration: string;
  durationEn?: string;
  basePrice: number;
  basePriceCurrency: Currency;
  baseDateStart?: string; // ISO date (YYYY-MM-DD)
  baseDateEnd?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  longDescription: string;
  longDescriptionEn?: string;
  popularTour: boolean;
  destinationStatus: boolean;
  opportunityTour: boolean;
  heroImagePath?: string;
  toursMapImage?: string;
  toursImage1?: string;
  toursImage2?: string;
  toursImage3?: string;
  highlights: CreateTourHighlightInput[];
  inclusions: CreateTourInclusionInput[];
  tips: CreateTourTipInput[];
  dailyPrograms: CreateTourDailyProgramInput[];
  datesPrices: CreateTourDatePriceInput[];
  weatherData: CreateTourWeatherDataInput[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  heroImage: string;
  heroImagePath: string;
  publishedAt: string; // ISO datetime
  readTime: number;
  authorName: string;
  authorTitle: string;
  authorImage: string | null;
  authorImagePath: string;
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

export type OmSyncStatus = "pending" | "sent" | "failed";

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
  /** Sadece status "onaylandi" olduğunda anlamlıdır; diğer durumlarda null/undefined. */
  omSyncStatus?: OmSyncStatus | null;
  omSyncAttempts?: number;
  omSyncLastError?: string | null;
  omSyncedAt?: string | null;
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
  /** Admin telefonu, user_metadata.phone. */
  phone?: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedTours: number;
  revisionRequests: number;
  revenueByCurrency: { currency: Currency; amount: number }[];
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
