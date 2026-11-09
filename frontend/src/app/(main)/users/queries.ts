"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { fetchUsers } from "./data";

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers });
}
