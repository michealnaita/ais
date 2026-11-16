"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { SubmissionResponse } from "@/types/api";

/** Instructor re-scores a submission's report with a new passage threshold. */
export function useRegenerateReport(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (similarityThreshold: number) =>
      api.patch<SubmissionResponse>(`/submissions/${submissionId}/similarity-threshold`, { similarityThreshold }).then(r => r.data),
    /* exact: the document HTML doesn't change, so leave its query alone. */
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.detail(submissionId), exact: true }),
      queryClient.invalidateQueries({ queryKey: ["submissions", "list"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]),
  });
}
