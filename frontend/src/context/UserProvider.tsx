"use client";

/* Supplies the current user to the client tree. Swap CURRENT_USER for a real session later. */
import { createContext, use, type ReactNode } from "react";
import { CURRENT_USER } from "@/services/mockUsers";
import type { CurrentUser } from "@/types/user";

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({ user = CURRENT_USER, children }: { user?: CurrentUser; children: ReactNode }) {
  return <UserContext value={user}>{children}</UserContext>;
}

export function useUser(): CurrentUser {
  const user = use(UserContext);
  if (!user) throw new Error("useUser() must be used inside <UserProvider>");
  return user;
}
