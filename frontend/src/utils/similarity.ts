export type SimilarityLevel = "low" | "med" | "high";

export function similarityLevel(score: number): SimilarityLevel {
  return score < 15 ? "low" : score < 30 ? "med" : "high";
}

/* Colours for a similarity score: green / amber / red theme tokens. Text uses the
   darker `-fg` shade for legibility; bar fills use the brighter `-dot` shade. */
const SIM_COLOR: Record<SimilarityLevel, string> = {
  low: "var(--color-green-fg)",
  med: "var(--color-amber-fg)",
  high: "var(--color-red-fg)",
};
const SIM_BAR_COLOR: Record<SimilarityLevel, string> = {
  low: "var(--color-green-dot)",
  med: "var(--color-amber-dot)",
  high: "var(--color-red-dot)",
};

export function similarityColor(score: number): string {
  return SIM_COLOR[similarityLevel(score)];
}

export function similarityBarColor(score: number): string {
  return SIM_BAR_COLOR[similarityLevel(score)];
}

export function similarityBand(score: number): string {
  return { low: "Low similarity", med: "Moderate similarity", high: "High similarity" }[similarityLevel(score)];
}
