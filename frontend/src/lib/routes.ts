/* App Router paths. */
export const ROUTES = {
  dashboard: "/",
  login: "/login",
  assignments: "/assignments",
  submissions: "/submissions",
  users: "/users",
  systemLogs: "/system-logs",
} as const;

export function reportRoute(submissionId: number | string): string {
  return `/similarity-report/${submissionId}`;
}
