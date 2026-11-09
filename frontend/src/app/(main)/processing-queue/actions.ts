"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { retryFailedJobs, retryJob } from "./data";

function useInvalidateJobs() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.processingQueue });
}

export function useRetryJob() {
  const onSuccess = useInvalidateJobs();
  return useMutation({ mutationFn: (id: number) => retryJob(id), onSuccess });
}

export function useRetryFailedJobs() {
  const onSuccess = useInvalidateJobs();
  return useMutation({ mutationFn: retryFailedJobs, onSuccess });
}
