/* Mock student-enrollment API backed by an in-memory store. Replace with real API calls. */
import { mockDelay } from "./mockDelay";
import type { EnrolledAssignment } from "@/types/enrolledAssignment";

/* Assignments the student is enrolled in (not yet submitted) */
const SEED: EnrolledAssignment[] = [
  { id: "a1", name: "Essay 3 — Ottoman Reform", course: "HIST 304", due: "Due Jun 2", soon: true, instructor: "Dr. Aylin Demir", words: "1,500–2,000 words", fileTypes: "PDF, DOCX", maxSize: "20 MB", description: "Analyse the Tanzimat reforms of the 19th century and assess their impact on Ottoman administrative modernisation. Cite at least four primary sources." },
  { id: "a2", name: "Seminar Response 6", course: "HIST 211", due: "Due Jun 4", soon: true, instructor: "Prof. Cem Yıldız", words: "600–800 words", fileTypes: "PDF, DOCX", maxSize: "10 MB", description: "Respond to this week's reading on millet-system governance. Engage critically with the assigned chapter and the seminar discussion." },
  { id: "a3", name: "Primary Source Analysis", course: "HIST 304", due: "Due Jun 9", soon: false, instructor: "Dr. Aylin Demir", words: "1,000 words", fileTypes: "PDF", maxSize: "15 MB", description: "Select one primary source from the provided archive and produce a close reading that situates it within its political context." },
  { id: "a4", name: "Republic & Reform Final Essay", course: "HIST 410", due: "Due Jun 16", soon: false, instructor: "Prof. Selin Kaya", words: "3,000 words", fileTypes: "PDF, DOCX", maxSize: "25 MB", description: "A capstone essay tracing the transition from empire to republic. An original argument and engagement with the historiography are required." },
];

/* Enrollment codes shared by instructors → assignment to join */
const ASSIGNMENT_CODES: Record<string, Omit<EnrolledAssignment, "id">> = {
  "HIST7F3K": { name: "Nationalism in the Late Empire", course: "HIST 304", due: "Due Jun 20", soon: false, instructor: "Dr. Aylin Demir", words: "1,500 words", fileTypes: "PDF, DOCX", maxSize: "20 MB", description: "Trace the emergence of nationalist movements during the empire's final decades and weigh their competing visions." },
  "HIST92QD": { name: "Atatürk's Reforms Essay", course: "HIST 410", due: "Due Jun 23", soon: false, instructor: "Prof. Selin Kaya", words: "2,500 words", fileTypes: "PDF, DOCX", maxSize: "25 MB", description: "Evaluate the social and legal reforms of the early republican period and their lasting effects on Turkish society." },
  "HIST5KP2": { name: "Seminar Response 7", course: "HIST 211", due: "Due Jun 25", soon: false, instructor: "Prof. Cem Yıldız", words: "700 words", fileTypes: "PDF, DOCX", maxSize: "10 MB", description: "Respond to the closing seminar on republican historiography and the framing of national memory." },
};

let enrolled = [...SEED];

/* "hist-7f3k" → "HIST7F3K" */
export function normalizeCode(code: string): string {
  return code.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export async function fetchEnrolledAssignments(): Promise<EnrolledAssignment[]> {
  await mockDelay();
  return enrolled;
}

/** Joins the assignment for an instructor-shared code; rejects with a user-facing message. */
export async function enrollWithCode(code: string): Promise<EnrolledAssignment> {
  await mockDelay();
  const found = ASSIGNMENT_CODES[normalizeCode(code)];
  if (!found) throw new Error("We couldn't find an assignment for that code. Check it and try again.");
  if (enrolled.some(a => a.name === found.name)) throw new Error("You're already enrolled in this assignment.");
  const assignment = { ...found, id: "a" + Date.now() };
  enrolled = [...enrolled, assignment];
  return assignment;
}
