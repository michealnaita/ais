import { similarityLevel } from "@/utils/similarity";
import type { Paragraph, SourceGroup } from "./types";

const LEVEL_COLOR = { low: "var(--color-green-fg)", med: "var(--color-amber-fg)", high: "var(--color-red-fg)" };

/* Report palette (this page uses --green/--amber/--red rather than --sim-*) */
export function scoreColor(score: number): string {
  return LEVEL_COLOR[similarityLevel(score)];
}

/* Group flagged paragraphs by matched source, strongest source first. */
export function groupPassagesBySource(paras: Paragraph[]): SourceGroup[] {
  const m: Partial<Record<string, SourceGroup>> = {};
  paras.forEach((p, i) => {
    if (!p.src) return;
    const g = (m[p.src] ??= { id: p.src, passages: [], top: 0 });
    g.passages.push({ idx: i, score: p.score, text: p.text, source: p.source });
    g.top = Math.max(g.top, p.score);
  });
  return (Object.values(m) as SourceGroup[]).sort((a, b) => b.top - a.top);
}
