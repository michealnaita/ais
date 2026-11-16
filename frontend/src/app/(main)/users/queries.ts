"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { User } from "./types";

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: () => api.get<User[]>("/users/").then(r => r.data) });
}
