/* Assignments API, shared by instructors (their own) and students (enrolled ones). */
import { api } from "@/lib/api";
import type { AssignmentResponse } from "@/types/api";

/** Scoped by role on the backend: admin = all, instructor = created, student = enrolled. */
export async function fetchAssignments(): Promise<AssignmentResponse[]> {
  const { data } = await api.get<AssignmentResponse[]>("/assignments/");
  return data;
}
