import type { FilterOption } from "@/types/filter";
import type { Tone } from "@/utils/tones";
import type { Role, UserFilter } from "./types";

export const ROLE_META: Record<Role, { label: string; tone: Tone }> = {
  student: { label: "Student", tone: "blue" },
  instructor: { label: "Instructor", tone: "green" },
  admin: { label: "Administrator", tone: "violet" },
};

export const FILTERS: FilterOption<UserFilter>[] = [
  { key: "all", label: "All" },
  { key: "student", label: "Students" },
  { key: "instructor", label: "Instructors" },
  { key: "admin", label: "Admins" },
  { key: "deactivated", label: "Deactivated" },
];
