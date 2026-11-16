"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchSubmissions, submitDocument } from "@/services/submissions";
import type { Submission } from "@/types/submission";
import { useAssignments } from "./useAssignments";

/* Poll while anything is still being analysed so rows flip to "complete" on their own. */
export const pollWhileProcessing = ({ state }: { state: { data?: Submission[] } }) =>
  state.data?.some(s => s.documentStatus === "queued") ? 3000 : false;

/** The signed-in student's own submissions. */
export function useMySubmissions() {
  return useQuery({
    queryKey: queryKeys.submissions.list({}),
    queryFn: () => fetchSubmissions(),
    refetchInterval: pollWhileProcessing,
  });
}

/** Student work handed in to one assignment. */
export function useAssignmentSubmissions(assignmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.submissions.list({ assignmentId }),
    queryFn: () => fetchSubmissions({ assignmentId }),
    enabled: !!assignmentId,
    refetchInterval: pollWhileProcessing,
  });
}

/** Everything handed in to the instructor's assignments: one request per assignment,
    since the API lists submissions by assignment. Newest first. */
export function useInstructorSubmissions() {
  const { data: assignments = [], isPending: assignmentsPending } = useAssignments();
  return useQueries({
    queries: assignments.map(a => ({
      queryKey: queryKeys.submissions.list({ assignmentId: a.id }),
      queryFn: () => fetchSubmissions({ assignmentId: a.id }),
      refetchInterval: pollWhileProcessing,
    })),
    combine: results => ({
      data: results.flatMap(r => r.data ?? []).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
      isPending: assignmentsPending || results.some(r => r.isPending),
    }),
  });
}

/** Upload a document and submit it; it starts out processing. Also used to replace one. */
export function useSubmitDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitDocument,
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]),
  });
}
