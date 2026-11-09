"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { createSubmission, fetchInstructorSubmissions, fetchStudentSubmissions, type SubmissionInput } from "@/services/submissions";
import type { Submission } from "@/types/submission";

/* Poll while anything is still being analysed so rows flip to "complete" on their own. */
const pollWhileProcessing = ({ state }: { state: { data?: Submission[] } }) =>
  state.data?.some(s => s.status === "processing") ? 1500 : false;

export function useStudentSubmissions(studentId: number) {
  return useQuery({
    queryKey: queryKeys.submissions.student(studentId),
    queryFn: () => fetchStudentSubmissions(studentId),
    refetchInterval: pollWhileProcessing,
  });
}

/** Everything handed in to the instructor's assignments. */
export function useInstructorSubmissions() {
  return useQuery({ queryKey: queryKeys.submissions.instructor, queryFn: fetchInstructorSubmissions });
}

/** Upload a document for review; it starts out "processing". */
export function useSubmitDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmissionInput) => createSubmission(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all }),
  });
}
