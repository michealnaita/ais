import type { FilterOption } from "@/types/filter";
import type { SubmissionFilter } from "@/types/submission";

export const FILTERS: FilterOption<SubmissionFilter>[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "complete", label: "Complete" },
  { key: "failed", label: "Failed" },
];
