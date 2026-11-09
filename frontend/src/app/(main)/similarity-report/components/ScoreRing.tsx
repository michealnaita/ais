import { scoreColor } from "../utils";

export function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex size-[92px] items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${score}%, #ededed 0)` }}>
      <div className="flex size-[74px] flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[25px] leading-none font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="mt-px text-xs font-semibold text-ink-tertiary">percent</span>
      </div>
    </div>
  );
}
