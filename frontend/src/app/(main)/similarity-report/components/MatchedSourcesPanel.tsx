import { Pencil } from "lucide-react";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { FLOATING_CARD } from "@/components/layout/FramelessPage";
import { similarityBand } from "@/utils/similarity";
import { cn } from "@/utils/cn";
import { RegenerateReportDialog } from "./RegenerateReportDialog";
import { ScoreRing } from "./ScoreRing";
import { SourceCard } from "./SourceCard";
import { SourceSheet } from "./SourceSheet";
import { CARD_HEADER } from "../constants";
import { scoreColor } from "../utils";
import type { SourceGroup, SourceId, TonedSource } from "../types";

type MatchedSourcesPanelProps = {
  submissionId: string;
  /** Instructors can change the threshold and re-score the report. */
  canRegenerate: boolean;
  score: number;
  threshold: number;
  groups: SourceGroup[];
  sources: Record<SourceId, TonedSource>;
  totalPassages: number;
  openSrc: SourceId | null;
  selIdx: number | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onOpenSource: (id: SourceId) => void;
  onCloseSource: () => void;
  onPickPassage: (index: number) => void;
};

/* Side card: overall score on top; beneath it, the matched sources list, or the open
   source's sheet of matched chunks. */
export function MatchedSourcesPanel({
  submissionId, canRegenerate, score, threshold, groups, sources, totalPassages, openSrc, selIdx, containerRef, onOpenSource, onCloseSource, onPickPassage,
}: MatchedSourcesPanelProps) {
  const [adjusting, setAdjusting] = useState(false);
  const openGroup = groups.find(g => g.id === openSrc);

  // Sheet opens at the top; going back restores where the list was scrolled to.
  const listScroll = useRef(0);
  const sheetOpen = !!openGroup;
  useLayoutEffect(() => {
    const cont = containerRef.current;
    if (cont) cont.scrollTop = sheetOpen ? 0 : listScroll.current;
  }, [sheetOpen, containerRef]);
  return (
    <aside className={cn(FLOATING_CARD, "flex w-[432px] shrink-0 flex-col overflow-hidden max-[1200px]:w-[360px]")}>
      <div className={cn(CARD_HEADER, "gap-3 px-4")}>
        <ScoreRing score={score} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] tracking-[.06em] text-ink-tertiary uppercase">Overall similarity</div>
          <div className="mt-0.5 truncate text-[15px] font-semibold" style={{ color: scoreColor(score) }}>{similarityBand(score)}</div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] tracking-[.06em] text-ink-tertiary uppercase">Threshold</div>
            <div className="mt-0.5 text-[15px] font-semibold tabular-nums">{threshold}%</div>
          </div>
          {canRegenerate && (
            <Button variant="outline" size="icon-sm" aria-label="Change threshold and regenerate report" title="Change threshold"
              onClick={() => setAdjusting(true)}>
              <Pencil />
            </Button>
          )}
        </div>
      </div>
      {adjusting && <RegenerateReportDialog submissionId={submissionId} threshold={threshold} onClose={() => setAdjusting(false)} />}

      {/* relative: makes this the offsetParent so scroll-to-passage offsets are measured from here */}
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-10" ref={containerRef}
        onScroll={e => { if (!sheetOpen) listScroll.current = e.currentTarget.scrollTop; }}>
        {openGroup ? (
          <SourceSheet
            key={openGroup.id}
            group={openGroup}
            source={sources[openGroup.id]}
            selIdx={selIdx}
            onBack={onCloseSource}
            onPickPassage={onPickPassage}
          />
        ) : (
          <div className="animate-in duration-200 fade-in-0">
            <div className="mb-3 px-1.5 py-0.5">
              <h3 className="text-[15px] font-semibold">Matched sources</h3>
              <p className="mt-[3px] text-[12.5px] text-ink-tertiary">
                {groups.length === 0
                  ? "No passages matched other documents at this threshold."
                  : `${totalPassages} passage${totalPassages === 1 ? "" : "s"} matched across ${groups.length} source${groups.length === 1 ? "" : "s"}`}
              </p>
            </div>
            {groups.map(g => (
              <SourceCard key={g.id} source={sources[g.id]} passageCount={g.passages.length} onOpen={() => onOpenSource(g.id)} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
