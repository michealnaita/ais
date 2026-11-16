import type { SystemLog } from "@/types/api";
import { formatRelative } from "@/utils/formatDate";
import { FEED_STYLE } from "../../constants";
import { feedKind } from "../../utils";

/* One line per event: icon, message, time right-aligned. */
export function ActivityFeedItem({ event }: { event: SystemLog }) {
  const I = FEED_STYLE[feedKind(event)].icon;
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <I size={14} />
      </span>
      <div className="min-w-0 flex-1 truncate text-[13.5px] text-ink" title={event.message}>{event.message}</div>
      <div className="shrink-0 text-xs text-ink-tertiary tabular-nums" title={event.timestamp}>{formatRelative(event.timestamp)}</div>
    </div>
  );
}
