"use client";

/* Similarity report for one submission. Shared by students and instructors;
   instructors also see the student's name. */
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { FLOATING_CARD, FramelessPage } from "@/components/layout/FramelessPage";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/utils/cn";
import { DocumentView } from "./DocumentView";
import { groupPassagesBySource, toneSources } from "../utils";
import { MatchedSourcesPanel } from "./MatchedSourcesPanel";
import { ReplaceSubmissionDialog } from "./ReplaceSubmissionDialog";
import { ReportHeader } from "./ReportHeader";
import type { SubmissionDetail } from "@/types/api";
import { formatDate } from "@/utils/formatDate";
import type { ReportContent, SourceId } from "../types";
import { useUser } from "@/context/UserProvider";

type SimilarityReportPageProps = {
  submission: SubmissionDetail;
  content: ReportContent;
  html: string;
};

export default function SimilarityReportPage({ submission, content, html }: SimilarityReportPageProps) {
  const router = useRouter();
  const role = useUser().role;
  /* Admins read the report like instructors, but only instructors can re-score it. */
  const view = role === "student" ? "student" : "instructor";

  const [replacing, setReplacing] = useState(false);
  const [openSrc, setOpenSrc] = useState<SourceId | null>(null);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { matches } = content;
  const grouped = useMemo(() => groupPassagesBySource(matches), [matches]);
  const sources = useMemo(() => toneSources(content.sources, grouped), [content.sources, grouped]);

  function scrollToMatch(i: number) {
    const cont = docRef.current;
    const el = cont?.querySelector<HTMLElement>(`[data-match="${i}"]`);
    if (el && cont) cont.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
  }
  function scrollToPassage(i: number) {
    const cont = panelRef.current;
    const el = cont?.querySelector<HTMLElement>(`[data-passage="${i}"]`);
    if (el && cont) cont.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  }

  // source card click → open its sheet and jump to its first match
  function openSource(id: SourceId) {
    setOpenSrc(id);
    const first = matches.findIndex(m => m.src === id);
    if (first >= 0) { setSelIdx(first); scrollToMatch(first); }
  }

  // sheet back button → all matched sources
  function closeSource() {
    setOpenSrc(null);
    setSelIdx(null);
  }

  // passage card click → highlight + scroll the matching chunk in the doc
  function pickPassage(i: number) {
    setSelIdx(i);
    scrollToMatch(i);
  }

  // matched chunk click → open its source's sheet + select the passage
  function pickMatch(i: number) {
    const src = matches[i].src;
    setOpenSrc(src);
    setSelIdx(i);
    setTimeout(() => scrollToPassage(i), 60);
  }

  function goBack() {
    if (history.length > 1) router.back();
    else router.push(ROUTES.submissions);
  }

  return (
    <FramelessPage>
      <section className={cn(FLOATING_CARD, "flex min-w-0 flex-1 flex-col overflow-hidden")}>
        <ReportHeader
          doc={submission.fileName}
          student={submission.submittedBy}
          assignment={submission.assignmentTitle}
          date={formatDate(submission.submittedAt)}
          view={view}
          onBack={goBack}
          onReplace={view === "student" ? () => setReplacing(true) : undefined}
        />
        <DocumentView
          html={html}
          matches={matches}
          sources={sources}
          selIdx={selIdx}
          containerRef={docRef}
          onPickMatch={pickMatch}
        />
      </section>
      <MatchedSourcesPanel
        submissionId={submission.id}
        canRegenerate={role === "instructor"}
        score={content.similarityScore}
        threshold={content.threshold}
        sources={sources}
        groups={grouped}
        totalPassages={matches.length}
        openSrc={openSrc}
        selIdx={selIdx}
        containerRef={panelRef}
        onOpenSource={openSource}
        onCloseSource={closeSource}
        onPickPassage={pickPassage}
      />
      {replacing && (
        <ReplaceSubmissionDialog submission={submission} onClose={() => setReplacing(false)} />
      )}
    </FramelessPage>
  );
}
