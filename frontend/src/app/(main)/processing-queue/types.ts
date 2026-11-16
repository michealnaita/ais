import type { AdminDashboard } from "@/types/api";

/** What the API exposes about the worker today: its status and the failed-job count. */
export type WorkerSummary = Pick<AdminDashboard, "failedJobCount"> & {
  workerStatus: AdminDashboard["systemHealth"]["workerStatus"];
};
