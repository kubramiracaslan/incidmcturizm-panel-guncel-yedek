import { SupabaseDataRepository } from "./supabase-repository";
import type { DataRepository } from "./repository";

/**
 * The single place the rest of the app imports data access from.
 *
 * Tours and blog posts are read from the site's existing Supabase project
 * (see `supabase-repository.ts`); agencies/requests, which have no
 * counterpart there, stay backed by the in-memory mock data.
 */
export const repository: DataRepository = new SupabaseDataRepository();

export type { DataRepository } from "./repository";
export * from "@/lib/types";
