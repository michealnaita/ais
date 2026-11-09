export type ReportView = "student" | "instructor";

/** The submission a report is about. */
export type ReportDetails = {
  doc: string;
  student: string;
  assignment: string;
  date: string;
  score: number;
};

export type SourceId = "arslan" | "kaya" | "yildiz" | "demir";

export type MatchSource = {
  name: string;
  meta: string;
  /** accent color */
  ac: string;
  /** tinted background */
  bg2: string;
};

export type Paragraph =
  | { text: string; src?: undefined }
  | { text: string; src: SourceId; score: number; source: string };

export type FlaggedParagraph = Extract<Paragraph, { src: SourceId }>;

export type Passage = {
  idx: number;
  score: number;
  text: string;
  source: string;
};

export type SourceGroup = {
  id: SourceId;
  passages: Passage[];
  top: number;
};

/** The analysed document and the sources its passages matched. */
export type ReportContent = {
  paras: Paragraph[];
  sources: Record<SourceId, MatchSource>;
};
