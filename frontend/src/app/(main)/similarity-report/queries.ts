"use client";

import { useQuery } from "@tanstack/react-query";
import { api, isApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { HtmlPreview, SubmissionDetail } from "@/types/api";

/** The submission with its similarity report (null until the document is scored).
    Polls while the document is still being processed. */
export function useSubmission(id: string) {
  return useQuery({
    queryKey: queryKeys.submissions.detail(id),
    queryFn: () => api.get<SubmissionDetail>(`/submissions/${id}`).then(r => r.data),
    refetchInterval: ({ state }) => state.data?.documentStatus === "queued" ? 3000 : false,
    retry: (count, error) => !isApiError(error, 403, 404) && count < 2,
  });
}

/** The submitted document rendered as HTML. Polls while the worker is still rendering it. */
export function useReportDocument(submissionId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.htmlPreview(submissionId),
    queryFn: () => api.get<HtmlPreview>(`/submissions/${submissionId}/html-preview`).then(r => r.data),
    enabled,
    staleTime: Infinity,
    refetchInterval: ({ state }) => state.data?.status === "processing" ? 3000 : false,
  });
}
