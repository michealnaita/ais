"use client";

/* Similarity report for one submission. Shared by students and instructors;
   instructors also see the student's name. */
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { DocumentView } from "./DocumentView";
import { groupPassagesBySource } from "../utils";
import { MatchedSourcesPanel } from "./MatchedSourcesPanel";
import { ReportHeader } from "./ReportHeader";
import { ReportTopBar } from "./ReportTopBar";
import type { ReportContent, ReportDetails, SourceId } from "../types";
import { useUser } from "@/context/UserProvider";

export default function SimilarityReportPage({ report, content }: { report: ReportDetails; content: ReportContent }) {
  const router = useRouter();
  const view = useUser().role === "instructor" ? "instructor" : "student";

  const [openSrc, setOpenSrc] = useState<SourceId | null>(null);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  const accRefs = useRef<Partial<Record<SourceId, HTMLDivElement | null>>>({});

  const { paras, sources } = content;
  const grouped = useMemo(() => groupPassagesBySource(paras), [paras]);
  const totalPassages = paras.filter(p => p.src).length;

  function scrollToPara(i: number) {
    const el = paraRefs.current[i], cont = docRef.current;
    if (el && cont) cont.scrollTo({ top: el.offsetTop - 90, behavior: "smooth" });
  }
  function scrollToAcc(id: SourceId) {
    const el = accRefs.current[id], cont = panelRef.current;
    if (el && cont) cont.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  }

  // accordion header click → expand/collapse the source
  function toggleSrc(id: SourceId) {
    const next = openSrc === id ? null : id;
    setOpenSrc(next);
    if (next) {
      const first = paras.findIndex(p => p.src === id);
      if (first >= 0) { setSelIdx(first); scrollToPara(first); }
    }
  }

  // passage card click → highlight + scroll the matching paragraph in the doc
  function pickPassage(i: number) {
    setSelIdx(i);
    scrollToPara(i);
  }

  // flagged paragraph click → open its source accordion + select the passage
  function pickPara(i: number) {
    const p = paras[i];
    if (!p.src) return;
    const src = p.src;
    setOpenSrc(src);
    setSelIdx(i);
    setTimeout(() => scrollToAcc(src), 60);
  }

  function goBack() {
    if (history.length > 1) router.back();
    else router.push(ROUTES.submissions);
  }

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ReportTopBar onBack={goBack} onDownload={() => toast(`Preparing ${report.doc} for download…`)} />
        <ReportHeader {...report} view={view} />

        <div className="flex min-h-0 flex-1">
          <DocumentView
            paras={paras}
            sources={sources}
            selIdx={selIdx}
            containerRef={docRef}
            registerPara={(i, el) => { paraRefs.current[i] = el; }}
            onPickPara={pickPara}
          />
          <MatchedSourcesPanel
            sources={sources}
            groups={grouped}
            totalPassages={totalPassages}
            openSrc={openSrc}
            selIdx={selIdx}
            containerRef={panelRef}
            registerSource={(id, el) => { accRefs.current[id] = el; }}
            onToggleSource={toggleSrc}
            onPickPassage={pickPassage}
            onViewSource={src => toast(`Opening full report for ${src.name}`)}
          />
        </div>
      </div>
    </>
  );
}
