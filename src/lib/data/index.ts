import { MockDataRepository } from "./mock-repository";
import type { DataRepository } from "./repository";

/**
 * The single place the rest of the app imports data access from.
 *
 * Swapping to the production backend later is a one-line change here
 * (e.g. `export const repository: DataRepository = new ApiDataRepository()`)
 * — nothing outside `lib/data` needs to know the difference.
 */
export const repository: DataRepository = new MockDataRepository();

export type { DataRepository } from "./repository";
export * from "@/lib/types";
