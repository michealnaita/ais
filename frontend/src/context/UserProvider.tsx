"use client";

/* Supplies the auth session (loading, authenticated, user) to the whole app. Gating
   pages on it is ProtectedRoute's job. */
import { createContext, use, type ReactNode } from "react";
import { useAuthSession, type AuthSession } from "@/hooks/useAuthSession";
import type { CurrentUser } from "@/types/user";

const UserContext = createContext<AuthSession | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession();
  return <UserContext value={session}>{children}</UserContext>;
}

/** The whole auth session: loading, authenticated, the user once authenticated, and reload(). */
export function useAuth(): AuthSession {
  const session = use(UserContext);
  if (!session) throw new Error("useAuth() must be used inside <UserProvider>");
  return session;
}

/** The signed-in user. Only for components inside <ProtectedRoute>, which renders its
    children once the session is authenticated. */
export function useUser(): CurrentUser {
  const { user } = useAuth();
  if (!user) throw new Error("useUser() was called before the session was authenticated");
  return user;
}
