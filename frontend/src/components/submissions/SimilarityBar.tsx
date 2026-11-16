import type { SubmissionStatus } from "@/utils/submissionStatus";
import { similarityBarColor, similarityColor } from "@/utils/similarity";

export function SimilarityBar({ status, score }: { status: SubmissionStatus; score: number | null }) {
  if (status !== "processed" || score == null) {
    return <div className="w-full text-right text-sm text-[#c7c7c7]">—</div>;
  }
  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        {/* At least a short stub so very low scores still read as a bar, not a dot. */}
        <span className="block h-full min-w-1.5 rounded-full" style={{ width: `${Math.min(score, 100)}%`, background: similarityBarColor(score) }} />
      </div>
      <div className="w-10 text-right text-sm font-semibold tabular-nums" style={{ color: similarityColor(score) }}>{score}%</div>
    </div>
  );
}
