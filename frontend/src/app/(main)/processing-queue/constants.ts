import type { FilterOption } from "@/types/filter";
import type { QueueFilter } from "./types";

export const FILTERS: FilterOption<QueueFilter>[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "failed", label: "Failed" },
  { key: "complete", label: "Complete" },
];
