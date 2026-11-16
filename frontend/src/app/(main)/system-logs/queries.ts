"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { LogEntry } from "./types";

export function useLogs() {
  return useQuery({ queryKey: queryKeys.logs, queryFn: () => api.get<LogEntry[]>("/system-logs/").then(r => r.data) });
}
