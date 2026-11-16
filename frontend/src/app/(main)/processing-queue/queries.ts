"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { AdminDashboard } from "@/types/api";
import type { WorkerSummary } from "./types";

/** Worker status and failed jobs, read from the admin dashboard (there's no queue endpoint yet). */
export function useWorkerSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<AdminDashboard>("/dashboard/").then(r => r.data),
    select: (d): WorkerSummary => ({ workerStatus: d.systemHealth.workerStatus, failedJobCount: d.failedJobCount }),
    refetchInterval: 15_000,
  });
}
