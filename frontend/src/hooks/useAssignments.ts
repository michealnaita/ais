"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAssignments } from "@/services/assignments";

/** Assignments the signed-in user can see: an instructor's own, a student's enrolled ones, or all for an admin. */
export function useAssignments() {
  return useQuery({ queryKey: queryKeys.assignments, queryFn: fetchAssignments });
}
