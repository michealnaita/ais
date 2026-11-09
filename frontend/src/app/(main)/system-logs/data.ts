/* Mock system-logs API. Replace with real API calls. */
import { mockDelay } from "@/services/mockDelay";
import type { LogEntry } from "./types";

const LOGS: LogEntry[] = [
  { t: "10:42:09", src: "worker.tasks", sev: "info", msg: "Job #90412 started — embedding Elif_HIST304.pdf (14 passages)" },
  { t: "10:41:55", src: "api.submissions", sev: "info", msg: "New submission received from elif.yilmaz@university.edu" },
  { t: "10:40:31", src: "worker.tasks", sev: "error", msg: "Job #90408 failed — Unreadable file: corrupt DOCX header (Burak_HIST410.docx)" },
  { t: "10:39:18", src: "worker.tasks", sev: "info", msg: "Job #90398 complete — Zeynep_HIST211.docx · 31% similarity · 1.9s" },
  { t: "10:37:44", src: "chromadb.client", sev: "warning", msg: "Embedding request latency 1840ms exceeded 1500ms threshold" },
  { t: "10:36:02", src: "auth.accounts", sev: "info", msg: "New instructor account registered — s.dogan@university.edu" },
  { t: "10:34:50", src: "worker.tasks", sev: "error", msg: "Job #90405 failed — Embedding timeout after 30s (ChromaDB unreachable)" },
  { t: "10:33:12", src: "chromadb.client", sev: "error", msg: "Connection reset by peer — retrying (attempt 1/3) on :8001" },
  { t: "10:33:09", src: "chromadb.client", sev: "warning", msg: "Connection pool exhausted — 8/8 connections in use" },
  { t: "10:31:47", src: "api.submissions", sev: "info", msg: "New submission received from merve.aydin@university.edu" },
  { t: "10:30:21", src: "worker.tasks", sev: "info", msg: "Job #90396 complete — Selin_HIST304.pdf · 8% similarity · 2.3s" },
  { t: "10:28:55", src: "api.auth", sev: "warning", msg: "Failed login attempt for m.aslan@university.edu (bad password)" },
  { t: "10:27:30", src: "worker.tasks", sev: "error", msg: "Job #90402 failed — Text extraction returned empty (Kerem_HIST211.pdf)" },
  { t: "10:25:14", src: "api.users", sev: "info", msg: "Admin Murat Aslan deactivated account AIS-4015 (Can Demir)" },
  { t: "10:23:48", src: "scheduler", sev: "info", msg: "Health check passed — Flask API, ChromaDB, worker all reachable" },
  { t: "10:21:02", src: "auth.accounts", sev: "info", msg: "New student account registered — kerem.ozturk@university.edu" },
  { t: "10:19:37", src: "chromadb.client", sev: "warning", msg: "Index segment compaction took 4.1s (1.84GB)" },
  { t: "10:17:09", src: "worker.tasks", sev: "info", msg: "Job #90388 complete — Naz_HIST211.docx · 17% similarity · 1.6s" },
  { t: "10:15:52", src: "api.submissions", sev: "info", msg: "Batch ingest finished — 12 documents queued for processing" },
  { t: "10:12:40", src: "scheduler", sev: "info", msg: "Nightly repository backup completed — 9,712 documents archived" },
];

export async function fetchLogs(): Promise<LogEntry[]> {
  await mockDelay();
  return LOGS;
}
