import { TONE } from "@/utils/tones";
import type { UserCount } from "../../types";

export function UserBreakdown({ counts }: { counts: UserCount[] }) {
  return (
    <div className="flex flex-wrap gap-3.5">
      {counts.map(c => (
        <span className="flex items-center gap-1.5 text-[12.5px] text-ink-secondary" key={c.label}>
          <span className={`size-[7px] rounded-full ${TONE[c.tone].dot}`} />
          <b className="font-bold text-ink tabular-nums">{c.count}</b> {c.label}
        </span>
      ))}
    </div>
  );
}
