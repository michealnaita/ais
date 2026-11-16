/* Submissions API, shared by every role. */
import { api } from "@/lib/api";
import type { SubmissionResponse } from "@/types/api";
import { uploadDocument } from "./documents";

/** Without filters the backend returns the signed-in user's own submissions. */
export async function fetchSubmissions(params: { userId?: string; assignmentId?: string } = {}): Promise<SubmissionResponse[]> {
  const { data } = await api.get<SubmissionResponse[]>("/submissions/", { params });
  return data;
}

/** Upload a document and submit it to an assignment. Submitting again to the same
    assignment replaces the earlier submission (and its document). */
export async function submitDocument({ assignmentId, file }: { assignmentId: string; file: File }): Promise<SubmissionResponse> {
  const document = await uploadDocument(file);
  const { data } = await api.post<SubmissionResponse>("/submissions/", { assignmentId, documentId: document.id });
  return data;
}
