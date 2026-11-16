"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { User, UserFormData } from "./types";

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.users }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
  ]);
}

/** The API creates users in bulk; this sends a single one. */
export function useCreateUser() {
  const onSuccess = useInvalidateUsers();
  return useMutation({
    mutationFn: (data: UserFormData) => api.post<User[]>("/users/", [data]).then(r => r.data[0]),
    onSuccess,
  });
}

export function useDeactivateUser() {
  const onSuccess = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => api.patch<User>(`/users/${id}/deactivate`).then(r => r.data),
    onSuccess,
  });
}
