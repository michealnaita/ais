import type { Assignment, AssignmentStatus } from "@/types/assignment";

export type AssignmentFilter = "all" | AssignmentStatus;

export type AssignmentAction = "view" | "edit" | "close" | "delete";

export type AssignmentModal =
  | { type: "create" }
  | { type: "view" | "edit" | "delete"; a: Assignment };
