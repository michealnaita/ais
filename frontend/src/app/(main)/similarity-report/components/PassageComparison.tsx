import { cn } from "@/utils/cn";
import { scoreColor } from "../utils";
import type { Passage } from "../types";

type PassageComparisonProps = {
  passage: Passage;
  number: number;
  selected: boolean;
  onPick: () => void;
};

/* Side-by-side of the submitted text and the matched source text. */
export function PassageComparison({ passage, number, selected, onPick }: PassageComparisonProps) {
  return (
    <div
      className={cn(
        "mt-3 cursor-pointer rounded-[11px] border border-line p-[13px] transition hover:border-line-strong",
        selected && "border-(--ac) shadow-[0_0_0_1.5px_var(--ac)] hover:border-(--ac)",
      )}
      onClick={onPick}
    >
      <div className="mb-[11px] flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-secondary">Passage {number}</span>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: scoreColor(passage.score) }}>{passage.score}%</span>
      </div>
      <CompareLabel>This submission</CompareLabel>
      <div className={cn(BOX, "mb-[13px] border border-[#e7e7e7] bg-[#f3f4f6]")}>{passage.text}</div>
      <CompareLabel>Matched source</CompareLabel>
      <div className={cn(BOX, "border border-(--ac) bg-(--bg2)")}>{passage.source}</div>
    </div>
  );
}

const BOX = "rounded-[10px] px-3 py-[11px] font-reading text-[13.5px] leading-[1.55] text-[#222]";

function CompareLabel({ children }: { children: string }) {
  return (
    <div className="mb-[7px] flex items-center gap-2 text-[10.5px] font-bold tracking-[.05em] text-ink-tertiary uppercase">
      <span>{children}</span><span className="h-px flex-1 bg-line" />
    </div>
  );
}
