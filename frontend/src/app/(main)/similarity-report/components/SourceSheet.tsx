import { ArrowLeft, ExternalLink } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { Button } from "@/components/ui/button";
import { PassageComparison } from "./PassageComparison";
import { SourceSummary } from "./SourceCard";
import { toneStyle } from "../utils";
import type { SourceGroup, TonedSource } from "../types";

type SourceSheetProps = {
  group: SourceGroup;
  source: TonedSource;
  selIdx: number | null;
  onBack: () => void;
  onPickPassage: (index: number) => void;
};

/* Drill-in view for one matched source: its matched chunks, with a way back to the source list. */
export function SourceSheet({ group, source, selIdx, onBack, onPickPassage }: SourceSheetProps) {
  return (
    <div className="animate-in duration-200 fade-in-0 slide-in-from-right-4" style={toneStyle(source)}>
      <Button variant="ghost" size="sm" className="-ml-1.5 mb-2 text-ink-secondary" onClick={onBack}>
        <ArrowLeft size={15} /> All matched sources
      </Button>
      <div className="flex items-start gap-3 rounded-xl border border-(--ac) p-3.5">
        <span className="mt-[3px] size-3 shrink-0 rounded-[3px] bg-(--ac)" />
        <div className="min-w-0 flex-1">
          <SourceSummary source={source} passageCount={group.passages.length} />
        </div>
      </div>
      <div className="px-1.5 pt-1.5">
        {group.passages.map((ps, pi) => (
          /* data-passage: lets the page scroll a picked passage into view */
          <div key={ps.idx} data-passage={ps.idx}>
            <PassageComparison passage={ps} number={pi + 1} selected={selIdx === ps.idx} onPick={() => onPickPassage(ps.idx)} />
          </div>
        ))}
        <NotAvailable className="mt-3 flex">
          <Button variant="outline" className="w-full" disabled>
            <ExternalLink size={15} /> View full source document report
          </Button>
        </NotAvailable>
      </div>
    </div>
  );
}
