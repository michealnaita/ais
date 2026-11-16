export type ReportView = "student" | "instructor";

/** A similar document's id. */
export type SourceId = string;

/** Highlight colors for one source, as CSS values. Assigned by the frontend, not the server. */
export type SourceTone = {
  /** accent: borders, swatch, badge */
  ac: string;
  /** tinted background */
  bg2: string;
  /** text on the accent */
  on: string;
};

export type TonedSource = MatchSource & SourceTone;

/** A similar document, as the report panels show it. */
export type MatchSource = {
  name: string;
  meta: string;
  /** Who wrote the source; labels its matches in the document. */
  author: string;
  /** Share (0–100) of this document's passages that matched this source, computed by the backend. */
  matchPercent: number;
};

/* A chunk of the document that matched a source passage above the analysis threshold.
   Matches carry no score of their own — a match is a match; only the document has a percentage. */
export type Match = {
  /** `data-chunk-id` of the matched block in the document HTML. */
  chunkId: string;
  src: SourceId;
  /** The submission's text for this chunk. */
  text: string;
  /** The matched source's text. */
  source: string;
};

export type Passage = {
  /** Index into ReportContent.matches. */
  idx: number;
  text: string;
  source: string;
};

export type SourceGroup = {
  id: SourceId;
  passages: Passage[];
};

/** The report in the shape the page works with, built from the API's report by toReportContent(). */
export type ReportContent = {
  /** Overall document similarity (0–100), computed by the backend. */
  similarityScore: number;
  /** Passage similarity threshold (0–100) the report was generated with. */
  threshold: number;
  matches: Match[];
  sources: Record<SourceId, MatchSource>;
};
