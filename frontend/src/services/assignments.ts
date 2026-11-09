/* Mock instructor-assignments API backed by an in-memory store. Replace with real API calls. */
import { mockDelay } from "./mockDelay";
import type { Assignment, AssignmentFormData } from "@/types/assignment";

export const SEED_ASSIGNMENTS: Assignment[] = [
  { id: 1, name: "Essay 3 — Ottoman Reform", course: "HIST 304", deadline: "Jun 2, 2026", iso: "2026-06-02", submitted: 18, total: 25, status: "open" },
  { id: 2, name: "Seminar Response 6", course: "HIST 211", deadline: "Jun 4, 2026", iso: "2026-06-04", submitted: 22, total: 30, status: "open" },
  { id: 3, name: "Primary Source Analysis", course: "HIST 304", deadline: "Jun 9, 2026", iso: "2026-06-09", submitted: 5, total: 25, status: "open" },
  { id: 4, name: "Atatürk's Reforms Essay", course: "HIST 410", deadline: "Jun 23, 2026", iso: "2026-06-23", submitted: 2, total: 18, status: "open" },
  { id: 5, name: "Republic & Reform Final Essay", course: "HIST 410", deadline: "Jun 16, 2026", iso: "2026-06-16", submitted: 0, total: 18, status: "upcoming" },
  { id: 6, name: "Nationalism in the Late Empire", course: "HIST 304", deadline: "Jun 20, 2026", iso: "2026-06-20", submitted: 0, total: 25, status: "upcoming" },
  { id: 7, name: "Midterm Paper", course: "HIST 304", deadline: "May 10, 2026", iso: "2026-05-10", submitted: 24, total: 25, status: "closed" },
  { id: 8, name: "Tanzimat Document Study", course: "HIST 211", deadline: "Apr 28, 2026", iso: "2026-04-28", submitted: 28, total: 30, status: "closed" },
];

let assignments = [...SEED_ASSIGNMENTS];

export async function fetchAssignments(): Promise<Assignment[]> {
  await mockDelay();
  return assignments;
}

export async function createAssignment(data: AssignmentFormData): Promise<Assignment> {
  await mockDelay();
  const created: Assignment = { id: Date.now(), submitted: 0, ...data };
  assignments = [created, ...assignments];
  return created;
}

export async function updateAssignment(id: number, data: Partial<AssignmentFormData>): Promise<void> {
  await mockDelay();
  assignments = assignments.map(a => a.id === id ? { ...a, ...data } : a);
}

export async function deleteAssignment(id: number): Promise<void> {
  await mockDelay();
  assignments = assignments.filter(a => a.id !== id);
}
