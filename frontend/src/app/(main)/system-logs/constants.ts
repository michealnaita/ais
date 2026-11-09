import type { FilterOption } from "@/types/filter";
import type { LogFilter } from "./types";

export const FILTERS: FilterOption<LogFilter>[] = [
  { key: "all", label: "All" },
  { key: "info", label: "Info" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
];
