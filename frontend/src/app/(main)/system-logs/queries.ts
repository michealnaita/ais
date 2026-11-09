"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchLogs } from "./data";

export function useLogs() {
  return useQuery({ queryKey: queryKeys.logs, queryFn: fetchLogs });
}
