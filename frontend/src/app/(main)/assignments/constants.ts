import type { FilterOption } from "@/types/filter";
import type { AssignmentFilter } from "./types";

export const FILTERS: FilterOption<AssignmentFilter>[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
];

/** The backend stores enrollment codes in a 10-character column. */
export const ENROLLMENT_CODE_MAX = 10;
