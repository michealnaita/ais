/* Lifecycle of a submitted document through the processing pipeline. */
export type SubmissionStatus = "pending" | "processing" | "complete" | "failed";

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  complete: "Complete",
  failed: "Failed",
};
