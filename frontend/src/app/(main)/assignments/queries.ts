"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAssignmentSubmissions } from "@/services/submissions";

/** Student work handed in to one assignment (the "View submissions" dialog). */
export function useAssignmentSubmissions(assignmentName: string) {
  return useQuery({
    queryKey: queryKeys.submissions.assignment(assignmentName),
    queryFn: () => fetchAssignmentSubmissions(assignmentName),
  });
}
