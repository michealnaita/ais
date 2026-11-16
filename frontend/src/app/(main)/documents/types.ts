import type { DocumentResponse, DocumentStatus } from "@/types/api";

/** A document in the repository, independent of any assignment (the API's DocumentResponse). */
export type RepositoryDocument = DocumentResponse;

export type DocumentFilter = "all" | DocumentStatus;
