import type { FilterOption } from "@/types/filter";
import type { DocumentFilter } from "./types";

export const FILTERS: FilterOption<DocumentFilter>[] = [
  { key: "all", label: "All" },
  { key: "queued", label: "Processing" },
  { key: "processed", label: "Complete" },
  { key: "failed", label: "Failed" },
];
