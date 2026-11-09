import { TONE } from "@/utils/tones";
import { FEED_STYLE } from "../../constants";
import type { FeedEvent } from "../../types";

export function ActivityFeedItem({ event }: { event: FeedEvent }) {
  const st = FEED_STYLE[event.kind];
  const I = st.icon;
  return (
    <div className="flex gap-[13px] px-3 py-3.5">
      <span className={`mt-px flex size-8 shrink-0 items-center justify-center rounded-[9px] ${TONE[st.tone].bg} ${TONE[st.tone].fg}`}>
        <I size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.8px] leading-[1.45] text-ink">{event.text[0]}<b className="font-semibold">{event.text[1]}</b>{event.text[2]}</div>
        <div className="mt-0.5 text-xs text-ink-tertiary">{event.time}</div>
      </div>
    </div>
  );
}
