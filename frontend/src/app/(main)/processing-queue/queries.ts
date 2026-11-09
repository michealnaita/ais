"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchJobs } from "./data";

export function useJobs() {
  return useQuery({ queryKey: queryKeys.processingQueue, queryFn: fetchJobs });
}
