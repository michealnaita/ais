const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

/* API timestamps are ISO 8601 in UTC; these show them in the viewer's time zone. */

/** "2026-06-02T12:00:00Z" → "Jun 2, 2026" */
export function formatDate(iso: string): string {
  return iso ? DATE.format(new Date(iso)) : "";
}

/** "2026-06-02T12:00:00Z" → "Jun 2, 2026, 3:00 PM" */
export function formatDateTime(iso: string): string {
  return iso ? DATE_TIME.format(new Date(iso)) : "";
}

/** "3m ago", "2h ago", "5d ago", or the date once it's over a week old. */
export function formatRelative(iso: string, now = Date.now()): string {
  const mins = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days <= 7 ? `${days}d ago` : formatDate(iso);
}
