import type { FilterOption } from "@/types/filter";
import type { AssignmentFilter } from "./types";

export const FILTERS: FilterOption<AssignmentFilter>[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "upcoming", label: "Upcoming" },
  { key: "closed", label: "Closed" },
];

/* Fixed "today" for the prototype; deadlines before this are flagged as past. */
export const TODAY_ISO = "2026-05-30";
