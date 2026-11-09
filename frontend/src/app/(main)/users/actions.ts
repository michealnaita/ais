"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { createUser, updateUser } from "./data";
import type { User, UserFormData } from "./types";

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.users });
}

export function useCreateUser() {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: (data: UserFormData) => createUser(data), onSuccess });
}

export function useUpdateUser() {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data), onSuccess });
}

/** Deactivate an active account, or reactivate a deactivated one. */
export function useToggleUserStatus() {
  const onSuccess = useInvalidateUsers();
  return useMutation({ mutationFn: (user: User) => updateUser(user.id, { active: !user.active }), onSuccess });
}
