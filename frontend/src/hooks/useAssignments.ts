"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAssignments } from "@/services/assignments";

/** The instructor's assignments. */
export function useAssignments() {
  return useQuery({ queryKey: queryKeys.assignments, queryFn: fetchAssignments });
}
