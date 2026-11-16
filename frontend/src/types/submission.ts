import type { DocumentStatus, SubmissionResponse } from "./api";

/** A document submitted to an assignment for integrity review (the API's SubmissionResponse). */
export type Submission = SubmissionResponse;

export type SubmissionFilter = "all" | DocumentStatus;
