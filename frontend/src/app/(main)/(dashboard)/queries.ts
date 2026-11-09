"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchAdminOverview } from "./data";

/** System status, recent activity and headline counts for the admin dashboard. */
export function useAdminOverview() {
  return useQuery({ queryKey: queryKeys.adminOverview, queryFn: fetchAdminOverview });
}
