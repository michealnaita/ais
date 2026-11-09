import { ChevronDown, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";
import { PassageComparison } from "./PassageComparison";
import { scoreColor } from "../utils";
import type { MatchSource, SourceGroup } from "../types";
import { Button } from "@/components/ui/button";

type SourceAccordionProps = {
  group: SourceGroup;
  source: MatchSource;
  open: boolean;
  selIdx: number | null;
  register: (el: HTMLDivElement | null) => void;
  onToggle: () => void;
  onPickPassage: (index: number) => void;
  onViewSource: () => void;
};

export function SourceAccordion({ group, source, open, selIdx, register, onToggle, onPickPassage, onViewSource }: SourceAccordionProps) {
  const n = group.passages.length;
  return (
    <div ref={register} className="mb-2" style={{ "--ac": source.ac, "--bg2": source.bg2 } as CSSProperties}>
      <Button
        variant="outline"
        aria-expanded={open}
        /* Layout only; the border takes the source's highlight colour when open. */
        className={cn("h-auto w-full items-start justify-start p-3.5 text-left whitespace-normal", open && "border-(--ac)")}
        onClick={onToggle}
      >
        <span className="mt-[3px] size-3 shrink-0 rounded-[3px] bg-(--ac)" />
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] leading-[1.3] font-semibold">{source.name}</div>
          <div className="mt-0.5 text-xs text-ink-tertiary">{source.meta}</div>
          <div className="mt-[9px] flex items-center gap-[9px]">
            <span className="text-xs font-medium text-ink-secondary">{n} matching passage{n > 1 ? "s" : ""}</span>
            <span className="rounded-md bg-black/[.04] px-[7px] py-0.5 text-xs font-bold tabular-nums" style={{ color: scoreColor(group.top) }}>{group.top}% top</span>
          </div>
        </div>
        <span className={cn("mt-0.5 shrink-0 text-ink-tertiary transition-transform duration-[180ms]", open && "rotate-180")}><ChevronDown size={17} /></span>
      </Button>
      {open && (
        <div className="px-1.5 pt-1.5">
          {group.passages.map((ps, pi) => (
            <PassageComparison key={ps.idx} passage={ps} number={pi + 1} selected={selIdx === ps.idx} onPick={() => onPickPassage(ps.idx)} />
          ))}
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={onViewSource}
          ><ExternalLink size={15} /> View full source document report</Button>
          <div className="mx-2 mt-4 mb-1 rounded-[2px] border-t-2 border-(--ac) opacity-50" />
        </div>
      )}
    </div>
  );
}
