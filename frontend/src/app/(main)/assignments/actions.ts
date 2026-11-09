"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { createAssignment, deleteAssignment, updateAssignment } from "@/services/assignments";
import type { AssignmentFormData } from "@/types/assignment";

function useInvalidateAssignments() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.assignments });
}

export function useCreateAssignment() {
  const onSuccess = useInvalidateAssignments();
  return useMutation({ mutationFn: (data: AssignmentFormData) => createAssignment(data), onSuccess });
}

export function useUpdateAssignment() {
  const onSuccess = useInvalidateAssignments();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignmentFormData }) => updateAssignment(id, data),
    onSuccess,
  });
}

/** Stop accepting submissions. */
export function useCloseAssignment() {
  const onSuccess = useInvalidateAssignments();
  return useMutation({ mutationFn: (id: number) => updateAssignment(id, { status: "closed" }), onSuccess });
}

export function useDeleteAssignment() {
  const onSuccess = useInvalidateAssignments();
  return useMutation({ mutationFn: (id: number) => deleteAssignment(id), onSuccess });
}
