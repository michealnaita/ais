import { similarityLevel } from "@/utils/similarity";
import type { CSSProperties } from "react";
import { SOURCE_COLORS } from "./constants";
import type { SimilarityReport } from "@/types/api";
import type { Match, MatchSource, ReportContent, SourceGroup, SourceId, SourceTone, TonedSource } from "./types";

const LEVEL_COLOR = { low: "var(--color-green-fg)", med: "var(--color-amber-fg)", high: "var(--color-red-fg)" };

/* Report palette (this page uses --green/--amber/--red rather than --sim-*) */
export function scoreColor(score: number): string {
  return LEVEL_COLOR[similarityLevel(score)];
}

/* Group matches by source, most-matched source first. */
export function groupPassagesBySource(matches: Match[]): SourceGroup[] {
  const m: Partial<Record<string, SourceGroup>> = {};
  matches.forEach((p, i) => {
    const g = (m[p.src] ??= { id: p.src, passages: [] });
    g.passages.push({ idx: i, text: p.text, source: p.source });
  });
  return (Object.values(m) as SourceGroup[]).sort((a, b) => b.passages.length - a.passages.length);
}

/* Colors for the similar document at `index`: SOURCE_COLORS[index % length], plus a light tint of it. */
export function sourceTone(index: number): SourceTone {
  const ac = SOURCE_COLORS[index % SOURCE_COLORS.length];
  return { ac, bg2: `color-mix(in srgb, ${ac} 12%, white)`, on: "#fff" };
}

/* Give each source its color by its index in the groups' (most-matched first) order. */
export function toneSources(sources: Record<SourceId, MatchSource>, groups: SourceGroup[]): Record<SourceId, TonedSource> {
  const order = [...groups.map(g => g.id), ...(Object.keys(sources) as SourceId[])];
  const unique = [...new Set(order)];
  return Object.fromEntries(
    unique.map((id, i) => [id, { ...sources[id], ...sourceTone(i) }]),
  ) as Record<SourceId, TonedSource>;
}

/* The --ac / --bg2 / --on CSS variables the report's tinted elements read. */
export function toneStyle({ ac, bg2, on }: SourceTone): CSSProperties {
  return { "--ac": ac, "--bg2": bg2, "--on": on } as CSSProperties;
}

/* The API's report → the page's model: one source per similar document, one match per
   matched chunk pair. */
export function toReportContent(report: SimilarityReport): ReportContent {
  const sources: Record<SourceId, MatchSource> = {};
  const matches: Match[] = [];
  for (const doc of report.similarDocuments) {
    sources[doc.id] = {
      name: doc.originalFileName,
      meta: `${doc.authorName} · ${doc.uploadedYear}`,
      author: doc.authorName,
      matchPercent: doc.similarityScore,
    };
    for (const { chunk, matchedChunk } of doc.similarChunks) {
      matches.push({ chunkId: chunk.id, src: doc.id, text: chunk.content, source: matchedChunk.content });
    }
  }
  return { similarityScore: report.similarityScore, threshold: report.similarityThreshold, matches, sources };
}
