import type { Assignment, AssignmentStatus } from "@/types/assignment";

export type AssignmentFilter = "all" | AssignmentStatus;

export type AssignmentAction = "view" | "enroll";

export type AssignmentModal =
  | { type: "create" }
  | { type: "enroll"; a: Assignment };
