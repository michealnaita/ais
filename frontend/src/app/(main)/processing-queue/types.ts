import type { SubmissionStatus } from "@/utils/submissionStatus";

export type Job = {
  id: number;
  file: string;
  owner: string;
  assignment: string;
  status: SubmissionStatus;
  progress?: number;
  queued: string;
  err?: string | null;
};

export type QueueFilter = "active" | SubmissionStatus;
