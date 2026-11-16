"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { AssignmentResponse, CreateAssignmentInput, EnrollResponse } from "@/types/api";

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignmentInput) => api.post<AssignmentResponse>("/assignments/", data).then(r => r.data),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]),
  });
}

/** Add students to an assignment by email. All or nothing: a 400 lists any emails
    without a student account. Students already enrolled come back in `alreadyEnrolled`. */
export function useEnrollStudents(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emails: string[]) => api.post<EnrollResponse>(`/assignments/${assignmentId}/enroll`, { emails }).then(r => r.data),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.assignmentEnrollments(assignmentId) }),
    ]),
  });
}
