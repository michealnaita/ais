import type { SubmissionStatus } from "@/utils/submissionStatus";

/** A document submitted for integrity review. */
export type Submission = {
  id: number;
  /** File name. */
  name: string;
  ext: string;
  size: string;
  assignment: string;
  course?: string;
  date: string;
  status: SubmissionStatus;
  score: number | null;
  studentId: number;
  student: string;
};

export type SubmissionFilter = "all" | Exclude<SubmissionStatus, "pending">;
