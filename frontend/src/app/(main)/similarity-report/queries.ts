"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchSubmission } from "@/services/submissions";
import { fetchReportContent } from "./data";

export function useSubmission(id: number) {
  return useQuery({ queryKey: queryKeys.submissions.detail(id), queryFn: () => fetchSubmission(id) });
}

/** Paragraphs and matched sources for a submission's report. */
export function useReportContent(submissionId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.similarityReport(submissionId),
    queryFn: fetchReportContent,
    enabled,
  });
}
