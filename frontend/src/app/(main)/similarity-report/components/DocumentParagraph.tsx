import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";
import type { MatchSource, Paragraph, SourceId } from "../types";

type DocumentParagraphProps = {
  para: Paragraph;
  sources: Record<SourceId, MatchSource>;
  selected: boolean;
  onPick: () => void;
  register: (el: HTMLParagraphElement | null) => void;
};

const PARA = "mb-[18px] rounded-lg py-1 font-reading text-[17px] leading-[1.72] text-[#1d1d1d]";

/* Plain paragraph, or a highlighted one tinted with its matched source's color (--ac / --bg2). */
export function DocumentParagraph({ para, sources, selected, onPick, register }: DocumentParagraphProps) {
  if (!para.src) return <p className={PARA}>{para.text}</p>;
  const src = sources[para.src];
  return (
    <p
      ref={register}
      className={cn(
        PARA,
        "relative -ml-1 cursor-pointer border-l-[3px] border-(--ac) bg-(--bg2) px-4 py-3 transition hover:brightness-[.985]",
        selected && "shadow-[0_0_0_2px_var(--ac),0_6px_20px_rgba(0,0,0,.08)]",
      )}
      style={{ "--ac": src.ac, "--bg2": src.bg2 } as CSSProperties}
      onClick={onPick}
    >
      <span className="absolute -top-[9px] right-2.5 rounded-full bg-(--ac) px-[7px] py-px font-sans text-[10.5px] font-bold tracking-[.02em] text-white">
        {para.score}% match
      </span>
      {para.text}
    </p>
  );
}
