import type { DocumentStatus } from "@/types/api";

/* A submission's status is its document's status in the processing pipeline.
   "queued" covers both waiting for and being processed by the worker. */
export type SubmissionStatus = DocumentStatus;

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  queued: "Processing",
  processed: "Complete",
  failed: "Failed",
};
