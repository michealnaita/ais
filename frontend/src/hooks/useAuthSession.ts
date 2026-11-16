"use client";

/* Loads the signed-in user's session on mount: reads the session token from its
   cookie and, if it's missing or expired, asks the backend to refresh it. */
import { useCallback, useEffect, useState } from "react";
import { isSessionExpired, readSessionToken, refreshSession, toCurrentUser } from "@/services/auth";
import type { CurrentUser } from "@/types/user";

export type AuthState =
  | { loading: true; authenticated: false; user: null }
  | { loading: false; authenticated: true; user: CurrentUser }
  | { loading: false; authenticated: false; user: null };

export type AuthSession = AuthState & {
  /** Load the session again, e.g. after signing in or out. */
  reload: () => Promise<void>;
};

const LOADING: AuthState = { loading: true, authenticated: false, user: null };
const SIGNED_OUT: AuthState = { loading: false, authenticated: false, user: null };

/** A valid session token's user, refreshing the token first if it has expired. */
async function loadSession(): Promise<AuthState> {
  const token = readSessionToken();
  if (token && !isSessionExpired(token)) {
    return { loading: false, authenticated: true, user: toCurrentUser(token) };
  }
  try {
    await refreshSession();
  } catch {
    return SIGNED_OUT;
  }
  const refreshed = readSessionToken();
  return refreshed ? { loading: false, authenticated: true, user: toCurrentUser(refreshed) } : SIGNED_OUT;
}

export function useAuthSession(): AuthSession {
  const [state, setState] = useState<AuthState>(LOADING);

  useEffect(() => {
    let cancelled = false;
    loadSession().then(s => { if (!cancelled) setState(s); });
    return () => { cancelled = true; };
  }, []);

  const reload = useCallback(async () => {
    setState(LOADING);
    setState(await loadSession());
  }, []);

  return { ...state, reload };
}
