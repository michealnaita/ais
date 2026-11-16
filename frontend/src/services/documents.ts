/* Document uploads, shared by student submissions and the admin repository. */
import { api } from "@/lib/api";
import type { DocumentResponse } from "@/types/api";

/** Only Word documents are accepted by the backend (it checks the content too). */
export const ACCEPTED_DOCUMENT_TYPES = ".docx";

export function isAcceptedDocument(file: File): boolean {
  return file.name.toLowerCase().endsWith(".docx");
}

/** Upload one file. It's stored temporarily until it's submitted (or persisted by an admin). */
export async function uploadDocument(file: File): Promise<DocumentResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<DocumentResponse>("/documents/upload", form);
  return data;
}
