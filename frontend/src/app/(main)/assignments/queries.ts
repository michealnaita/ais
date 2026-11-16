"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { EnrolledStudentResponse } from "@/types/api";

/** Students currently enrolled in one of the instructor's assignments. */
export function useAssignmentEnrollments(assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.assignmentEnrollments(assignmentId),
    queryFn: () => api.get<EnrolledStudentResponse[]>(`/assignments/${assignmentId}/enrollments`).then(r => r.data),
  });
}
