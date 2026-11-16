const SOON_MS = 3 * 24 * 60 * 60 * 1000;
const MONTH = new Intl.DateTimeFormat("en-US", { month: "short" });

/** How a deadline reads in assignment lists: "Due Jun 2", flagged when within three days. */
export function dueInfo(deadline: string, now = Date.now()) {
  const date = new Date(deadline);
  const left = date.getTime() - now;
  return {
    month: MONTH.format(date),
    day: String(date.getDate()),
    label: `Due ${MONTH.format(date)} ${date.getDate()}`,
    soon: left >= 0 && left <= SOON_MS,
    past: left < 0,
  };
}
