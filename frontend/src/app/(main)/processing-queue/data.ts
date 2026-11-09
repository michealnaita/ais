/* Mock processing-queue API backed by an in-memory store. Replace with real API calls. */
import { mockDelay } from "@/services/mockDelay";
import type { Job } from "./types";

const SEED: Job[] = [
  { id: 90412, file: "Elif_HIST304.pdf", owner: "Elif Yılmaz", assignment: "Essay 3 — Ottoman Reform", status: "processing", progress: 64, queued: "Started 12s ago" },
  { id: 90411, file: "Merve_HIST211.docx", owner: "Merve Aydın", assignment: "Seminar Response 6", status: "pending", queued: "Queued 40s ago" },
  { id: 90410, file: "Deniz_HIST304.pdf", owner: "Deniz Arslan", assignment: "Primary Source Analysis", status: "pending", queued: "Queued 1m ago" },
  { id: 90409, file: "Naz_HIST410.docx", owner: "Naz Eren", assignment: "Atatürk's Reforms Essay", status: "pending", queued: "Queued 2m ago" },
  { id: 90408, file: "Burak_HIST410.docx", owner: "Burak Çelik", assignment: "Atatürk's Reforms Essay", status: "failed", queued: "5m ago", err: "Unreadable file — corrupt DOCX" },
  { id: 90405, file: "Can_HIST304.pdf", owner: "Can Demir", assignment: "Essay 3 — Ottoman Reform", status: "failed", queued: "9m ago", err: "Embedding timeout (ChromaDB)" },
  { id: 90402, file: "Kerem_HIST211.pdf", owner: "Kerem Öztürk", assignment: "Seminar Response 6", status: "failed", queued: "14m ago", err: "Text extraction returned empty" },
  { id: 90398, file: "Zeynep_HIST211.docx", owner: "Zeynep Kaya", assignment: "Seminar Response 6", status: "complete", queued: "Done 3m ago" },
  { id: 90396, file: "Selin_HIST304.pdf", owner: "Selin Doğan", assignment: "Primary Source Analysis", status: "complete", queued: "Done 6m ago" },
];

let jobs = [...SEED];

const requeue = (j: Job): Job => ({ ...j, status: "pending", err: null, queued: "Re-queued just now" });

export async function fetchJobs(): Promise<Job[]> {
  await mockDelay();
  return jobs;
}

export async function retryJob(id: number): Promise<void> {
  await mockDelay();
  jobs = jobs.map(j => j.id === id ? requeue(j) : j);
}

/** Re-queues every failed job; resolves to how many were re-queued. */
export async function retryFailedJobs(): Promise<number> {
  await mockDelay();
  const n = jobs.filter(j => j.status === "failed").length;
  jobs = jobs.map(j => j.status === "failed" ? requeue(j) : j);
  return n;
}
