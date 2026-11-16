import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toneStyle } from "../utils";
import type { MatchSource, TonedSource } from "../types";

type SourceCardProps = {
  source: TonedSource;
  passageCount: number;
  onOpen: () => void;
};

/* One matched source in the list; opens the source's sheet of matched chunks. */
export function SourceCard({ source, passageCount, onOpen }: SourceCardProps) {
  return (
    <Button
      variant="outline"
      /* Layout only; the border takes the source's highlight colour on hover. */
      className="mb-2 h-auto w-full items-start justify-start p-3.5 text-left whitespace-normal hover:border-(--ac)"
      style={toneStyle(source)}
      onClick={onOpen}
    >
      <span className="mt-[3px] size-3 shrink-0 rounded-[3px] bg-(--ac)" />
      <div className="min-w-0 flex-1">
        <SourceSummary source={source} passageCount={passageCount} />
      </div>
      <span className="shrink-0 self-center text-ink-tertiary"><ChevronRight size={17} /></span>
    </Button>
  );
}

/* Name, meta line and match counts — shared by the card and the sheet header. */
export function SourceSummary({ source, passageCount }: { source: MatchSource; passageCount: number }) {
  return (
    <>
      <div className="text-[13.5px] leading-[1.3] font-semibold">{source.name}</div>
      <div className="mt-0.5 text-xs text-ink-tertiary">{source.meta}</div>
      <div className="mt-[9px] flex items-center gap-[9px]">
        <span className="text-xs font-medium text-ink-secondary">{passageCount} matching passage{passageCount > 1 ? "s" : ""}</span>
        <span className="rounded-md bg-black/[.04] px-[7px] py-0.5 text-xs font-semibold text-ink tabular-nums" title="Share of this document's passages that matched this source">{source.matchPercent}% of document</span>
      </div>
    </>
  );
}
