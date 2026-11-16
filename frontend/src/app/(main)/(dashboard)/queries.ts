"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { AdminDashboard, Dashboard, InstructorDashboard, StudentDashboard } from "@/types/api";

/* GET /dashboard/ returns a different shape per role; each dashboard asks for its own. */
function useDashboard<T extends Dashboard>(options: { refetchInterval?: number | false | ((q: { state: { data?: T } }) => number | false) } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<T>("/dashboard/").then(r => r.data),
    ...options,
  });
}

export const useStudentDashboard = () =>
  useDashboard<StudentDashboard>({
    refetchInterval: ({ state }) => state.data?.submissionHistory.some(s => s.documentStatus === "queued") ? 3000 : false,
  });

export const useInstructorDashboard = () =>
  useDashboard<InstructorDashboard>({
    refetchInterval: ({ state }) => state.data?.recentSubmissions.some(s => s.documentStatus === "queued") ? 3000 : false,
  });

/** System status, recent activity and headline counts for the admin dashboard. */
export const useAdminDashboard = () => useDashboard<AdminDashboard>({ refetchInterval: 15_000 });
