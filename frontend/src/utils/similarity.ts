export type SimilarityLevel = "low" | "med" | "high";

export function similarityLevel(score: number): SimilarityLevel {
  return score < 15 ? "low" : score < 30 ? "med" : "high";
}

/* Color for a similarity score: green / amber / red theme tokens. */
const SIM_COLOR: Record<SimilarityLevel, string> = {
  low: "var(--color-green-fg)",
  med: "var(--color-amber-fg)",
  high: "var(--color-red-fg)",
};

export function similarityColor(score: number): string {
  return SIM_COLOR[similarityLevel(score)];
}

export function similarityBand(score: number): string {
  return { low: "Low similarity", med: "Moderate similarity", high: "High similarity" }[similarityLevel(score)];
}
