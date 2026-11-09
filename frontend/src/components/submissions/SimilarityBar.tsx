import type { Submission } from "@/types/submission";
import { similarityColor } from "@/utils/similarity";

export function SimilarityBar({ status, score }: Pick<Submission, "status" | "score">) {
  if (status !== "complete" || score == null) {
    return <div className="w-full text-right text-sm text-[#c7c7c7]">—</div>;
  }
  const color = similarityColor(score);
  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="h-[5px] w-11 overflow-hidden rounded-full bg-[#eee]">
        <span className="block h-full rounded-full" style={{ width: `${Math.min(score, 100)}%`, background: color }} />
      </div>
      <div className="text-[14.5px] font-semibold tabular-nums" style={{ color }}>{score}%</div>
    </div>
  );
}
