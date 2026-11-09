import type { RefObject } from "react";
import { SourceAccordion } from "./SourceAccordion";
import type { MatchSource, SourceGroup, SourceId } from "../types";

type MatchedSourcesPanelProps = {
  groups: SourceGroup[];
  sources: Record<SourceId, MatchSource>;
  totalPassages: number;
  openSrc: SourceId | null;
  selIdx: number | null;
  containerRef: RefObject<HTMLDivElement | null>;
  registerSource: (id: SourceId, el: HTMLDivElement | null) => void;
  onToggleSource: (id: SourceId) => void;
  onPickPassage: (index: number) => void;
  onViewSource: (source: MatchSource) => void;
};

export function MatchedSourcesPanel({
  groups, sources, totalPassages, openSrc, selIdx, containerRef, registerSource, onToggleSource, onPickPassage, onViewSource,
}: MatchedSourcesPanelProps) {
  return (
    <div className="w-[432px] shrink-0 overflow-y-auto border-l border-line bg-panel px-4 pt-5 pb-[60px] max-[1200px]:w-[360px]" ref={containerRef}>
      <div className="mb-3 px-1.5 py-0.5">
        <h3 className="text-[15px] font-semibold">Matched sources</h3>
        <p className="mt-[3px] text-[12.5px] text-ink-tertiary">{totalPassages} passages matched across {groups.length} sources</p>
      </div>
      {groups.map(g => (
        <SourceAccordion
          key={g.id}
          group={g}
          source={sources[g.id]}
          open={openSrc === g.id}
          selIdx={selIdx}
          register={el => registerSource(g.id, el)}
          onToggle={() => onToggleSource(g.id)}
          onPickPassage={onPickPassage}
          onViewSource={() => onViewSource(sources[g.id])}
        />
      ))}
    </div>
  );
}
