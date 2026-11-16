import type { FilterOption } from "@/types/filter";
import type { UserFilter } from "./types";

export const FILTERS: FilterOption<UserFilter>[] = [
  { key: "all", label: "All" },
  { key: "student", label: "Students" },
  { key: "instructor", label: "Instructors" },
  { key: "admin", label: "Admins" },
  { key: "deactivated", label: "Deactivated" },
];
