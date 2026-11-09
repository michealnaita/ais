/* Mock submissions API shared by every role, backed by an in-memory store. Replace with real API calls. */
import { mockDelay } from "./mockDelay";
import { MOCK_USERS } from "./mockUsers";
import { SEED_ASSIGNMENTS } from "./assignments";
import type { Assignment } from "@/types/assignment";
import type { Submission } from "@/types/submission";


/* Fixed "today" for the prototype */
const TODAY_LABEL = "May 30, 2026";
const PROCESSING_MS = 4200;

const ME = MOCK_USERS.student;
const mine = (s: Omit<Submission, "studentId" | "student">): Submission => ({ ...s, studentId: ME.id, student: ME.name });

/* The mock student's own submissions */
const STUDENT_SUBMISSIONS: Submission[] = [
  mine({ id: 1, name: "Final_Essay_ClimatePolicy.docx", ext: "docx", size: "342 KB", assignment: "Essay 2 — Climate Policy", date: "May 28, 2026", status: "complete", score: 7 }),
  mine({ id: 2, name: "Research_Paper_v3.pdf", ext: "pdf", size: "1.2 MB", assignment: "Term Paper", date: "May 28, 2026", status: "processing", score: null }),
  mine({ id: 3, name: "Lab_Report_Week10.pdf", ext: "pdf", size: "880 KB", assignment: "Lab Report 10", date: "May 27, 2026", status: "processing", score: null }),
  mine({ id: 4, name: "Thesis_Chapter2_Methods.docx", ext: "docx", size: "560 KB", assignment: "Thesis Submission", date: "May 26, 2026", status: "complete", score: 23 }),
  mine({ id: 5, name: "Problem_Set_5.pdf", ext: "pdf", size: "410 KB", assignment: "Problem Set 5", date: "May 25, 2026", status: "failed", score: null }),
  mine({ id: 6, name: "Case_Study_Analysis.docx", ext: "docx", size: "295 KB", assignment: "Case Study 3", date: "May 24, 2026", status: "complete", score: 44 }),
  mine({ id: 7, name: "Group_Presentation.pptx", ext: "pptx", size: "4.1 MB", assignment: "Capstone — Group B", date: "May 23, 2026", status: "complete", score: 12 }),
  mine({ id: 8, name: "Reflection_Journal.docx", ext: "docx", size: "120 KB", assignment: "Weekly Reflection", date: "May 22, 2026", status: "processing", score: null }),
  mine({ id: 9, name: "Literature_Review.pdf", ext: "pdf", size: "1.6 MB", assignment: "Dissertation Proposal", date: "May 20, 2026", status: "complete", score: 31 }),
  mine({ id: 10, name: "Assignment1_Submission.docx", ext: "docx", size: "208 KB", assignment: "Assignment 1", date: "May 18, 2026", status: "failed", score: null }),
  mine({ id: 11, name: "Annotated_Bibliography.docx", ext: "docx", size: "176 KB", assignment: "Research Methods", date: "May 16, 2026", status: "complete", score: 5 }),
];

const NAMES = ["Elif Yılmaz","Zeynep Kaya","Can Demir","Aylin Şahin","Burak Çelik","Deniz Arslan","Selin Doğan","Emre Koç","Merve Aydın","Kerem Öztürk","Ece Polat","Mert Şimşek","Naz Eren","Onur Güneş","İrem Acar","Baran Yıldırım","Sena Korkmaz","Tolga Aksoy","Gizem Taş","Kaan Bulut","Derya Ünal","Volkan Erdoğan","Pelin Avcı","Berk Sönmez","Cansu Tekin","Ali Yavuz","Hande Kurt","Ozan Bayram"];

/* Deterministic fake class submissions for an instructor's assignment. */
function classSubmissions(a: Assignment): Submission[] {
  const out: Submission[] = [];
  for (let i = 0; i < a.submitted; i++) {
    const student = NAMES[i % NAMES.length];
    const ext = i % 3 === 0 ? "pdf" : "docx";
    const r = (i * 37) % 100;
    const status: Submission["status"] = r > 86 ? "processing" : r > 78 ? "failed" : "complete";
    const day = Math.max(1, parseInt(a.iso.slice(8)) - (i % 5));
    out.push({
      id: a.id * 1000 + i,
      name: `${student.split(" ")[0]}_${a.course.replace(" ", "")}.${ext}`,
      ext,
      size: `${180 + ((i * 53) % 900)} KB`,
      assignment: a.name,
      course: a.course,
      date: `${a.deadline.split(" ")[0]} ${day}, 2026`,
      status,
      score: status === "complete" ? ((i * 17) % 46) + 3 : null,
      studentId: 5000 + (i % NAMES.length),
      student,
    });
  }
  return out;
}

const CLASS_SUBMISSIONS = SEED_ASSIGNMENTS.flatMap(classSubmissions);

let submissions: Submission[] = [...STUDENT_SUBMISSIONS, ...CLASS_SUBMISSIONS];
const classIds = new Set(CLASS_SUBMISSIONS.map(s => s.id));

export type SubmissionInput = Pick<Submission, "name" | "ext" | "size" | "assignment" | "studentId" | "student">;

export async function fetchStudentSubmissions(studentId: number): Promise<Submission[]> {
  await mockDelay();
  return submissions.filter(s => s.studentId === studentId);
}

/** Submissions an instructor sees: everything handed in to their assignments. */
export async function fetchInstructorSubmissions(): Promise<Submission[]> {
  await mockDelay();
  return submissions.filter(s => classIds.has(s.id));
}

export async function fetchAssignmentSubmissions(assignmentName: string): Promise<Submission[]> {
  await mockDelay();
  return submissions.filter(s => classIds.has(s.id) && s.assignment === assignmentName);
}

export async function fetchSubmission(id: number): Promise<Submission | null> {
  await mockDelay();
  return submissions.find(s => s.id === id) ?? null;
}

/** New uploads start "processing" and complete after a simulated pipeline delay. */
export async function createSubmission(input: SubmissionInput): Promise<Submission> {
  await mockDelay();
  const created: Submission = { ...input, id: Date.now(), date: TODAY_LABEL, status: "processing", score: null };
  submissions = [created, ...submissions];
  setTimeout(() => {
    submissions = submissions.map(s => s.id === created.id ? { ...s, status: "complete", score: Math.floor(Math.random() * 38) + 3 } : s);
  }, PROCESSING_MS);
  return created;
}
