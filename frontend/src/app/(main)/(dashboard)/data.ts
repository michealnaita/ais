/* Mock admin-overview API. Replace with real API calls. */
import { mockDelay } from "@/services/mockDelay";
import type { AdminOverview, FeedEvent, SystemService, UserCount } from "./types";

const SYSTEMS: SystemService[] = [
  { name: "Flask API", sub: "REST API · gunicorn · :8000", icon: "server", up: true, detail: "Responding · 42 ms avg" },
  { name: "ChromaDB", sub: "Vector store · persistent · :8001", icon: "database", up: true, detail: "Healthy · 1.84 GB indexed" },
  { name: "Background worker", sub: "Celery · redis broker", icon: "cpu", up: true, detail: "Running · 1 task active" },
];

const FEED: FeedEvent[] = [
  { kind: "submission", text: ["New submission ", "Elif Yılmaz", " — Essay 3, Ottoman Reform"], time: "2 min ago" },
  { kind: "complete", text: ["Processing complete ", "Can_HIST304.pdf", " — 12% similarity"], time: "6 min ago" },
  { kind: "user", text: ["New instructor account ", "Dr. Selin Doğan", " registered"], time: "21 min ago" },
  { kind: "complete", text: ["Processing complete ", "Zeynep_HIST211.docx", " — 31% similarity"], time: "34 min ago" },
  { kind: "failed", text: ["Processing failed ", "Burak_HIST410.docx", " — unreadable file"], time: "48 min ago" },
  { kind: "submission", text: ["New submission ", "Merve Aydın", " — Seminar Response 6"], time: "1 hr ago" },
  { kind: "user", text: ["New student account ", "Kerem Öztürk", " registered"], time: "2 hr ago" },
];

const USER_COUNTS: UserCount[] = [
  { tone: "blue", count: "1,196", label: "students" },
  { tone: "green", count: "84", label: "instructors" },
  { tone: "violet", count: "4", label: "admins" },
];

const FAILED_JOBS = 3;

export async function fetchAdminOverview(): Promise<AdminOverview> {
  await mockDelay();
  return { systems: SYSTEMS, feed: FEED, userCounts: USER_COUNTS, failedJobs: FAILED_JOBS };
}
