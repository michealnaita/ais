"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/lib/queryKeys";
import { enrollWithCode, fetchEnrolledAssignments } from "@/services/enrollment";
import type { EnrolledAssignment } from "@/types/enrolledAssignment";

/* The student's enrolled assignments plus which dialog (join / detail) is open. */
export function useEnrolledAssignments() {
  const { data: assignments = [] } = useQuery({ queryKey: queryKeys.enrolledAssignments, queryFn: fetchEnrolledAssignments });
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<EnrolledAssignment | null>(null);

  return { assignments, addOpen, setAddOpen, detail, setDetail };
}

/** Join an assignment with an instructor-shared code. Errors carry a user-facing message. */
export function useEnrollWithCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => enrollWithCode(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.enrolledAssignments }),
  });
}
