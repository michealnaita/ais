import type { RefObject } from "react";
import { DocumentParagraph } from "./DocumentParagraph";
import type { MatchSource, Paragraph, SourceId } from "../types";

type DocumentViewProps = {
  paras: Paragraph[];
  sources: Record<SourceId, MatchSource>;
  selIdx: number | null;
  containerRef: RefObject<HTMLDivElement | null>;
  registerPara: (index: number, el: HTMLParagraphElement | null) => void;
  onPickPara: (index: number) => void;
};

export function DocumentView({ paras, sources, selIdx, containerRef, registerPara, onPickPara }: DocumentViewProps) {
  return (
    <div className="min-w-0 flex-1 overflow-y-auto pt-[34px] pb-20" ref={containerRef}>
      <div className="mx-auto max-w-[720px] px-10">
        {paras.map((p, i) => (
          <DocumentParagraph key={i} para={p} sources={sources} selected={selIdx === i}
            onPick={() => onPickPara(i)} register={el => registerPara(i, el)} />
        ))}
      </div>
    </div>
  );
}
