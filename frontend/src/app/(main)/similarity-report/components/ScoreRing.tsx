import { scoreColor } from "../utils";

/* Compact ring: the arc fills to the overall similarity percentage. */
export function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${score}%, #ededed 0)` }}>
      <div className="flex size-[46px] items-center justify-center rounded-full bg-white">
        <span className="text-[17px] leading-none font-bold tabular-nums" style={{ color }}>
          {score}<span className="text-[11px] font-semibold">%</span>
        </span>
      </div>
    </div>
  );
}
