/* App Router paths. */
export const ROUTES = {
  dashboard: "/",
  login: "/login",
  assignments: "/assignments",
  submissions: "/submissions",
  users: "/users",
  documents: "/documents",
  systemLogs: "/system-logs",
} as const;

export function reportRoute(submissionId: number | string): string {
  return `/similarity-report/${submissionId}`;
}

export function assignmentSubmissionsRoute(assignmentId: number | string): string {
  return `/assignments/${assignmentId}/submissions`;
}

/** Query parameter on /login holding the page to return to after signing in. */
export const NEXT_PARAM = "next";

/** The login page, remembering `from` (a path, optionally with a query) to return to. */
export function loginRoute(from?: string): string {
  return from && from !== ROUTES.login ? `${ROUTES.login}?${new URLSearchParams({ [NEXT_PARAM]: from })}` : ROUTES.login;
}

/** Where to go after signing in: the `next` value if it's a path inside this app,
    otherwise the dashboard. Rejects absolute and protocol-relative URLs ("//evil.com",
    "/\\evil.com"), so a crafted link can't send users off-site. */
export function afterLoginRoute(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return ROUTES.dashboard;
  const url = new URL(next, "http://app.local");
  if (url.origin !== "http://app.local" || url.pathname === ROUTES.login) return ROUTES.dashboard;
  return url.pathname + url.search + url.hash;
}
