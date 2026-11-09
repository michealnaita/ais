import { similarityBand } from "@/utils/similarity";
import type { ReportDetails, ReportView } from "../types";
import { scoreColor } from "../utils";
import { ScoreRing } from "./ScoreRing";

const Dot = () => <span className="size-[3px] rounded-full bg-[#c4c4c4]" />;

export function ReportHeader({ doc, student, assignment, date, score, view }: ReportDetails & { view: ReportView }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-[30px] border-b border-line px-7 py-[22px]">
      <div className="min-w-0">
        <div className="truncate font-display text-[27px] leading-[1.15] font-medium tracking-[-0.01em]">{doc}</div>
        <div className="mt-2 flex flex-wrap items-center gap-[9px] text-[13.5px] text-ink-secondary">
          {view === "instructor" && <><b className="font-semibold text-ink">{student}</b><Dot /></>}
          <span>{assignment}</span><Dot />
          <span>Submitted {date}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <div className="text-[12.5px] tracking-[.06em] text-ink-tertiary uppercase">Overall similarity</div>
          <div className="mt-[3px] text-[15px] font-semibold" style={{ color: scoreColor(score) }}>{similarityBand(score)}</div>
        </div>
        <ScoreRing score={score} />
      </div>
    </div>
  );
}
