import { useEffect, useMemo, useRef, type MouseEvent, type RefObject } from "react";
import type { Match, SourceId, TonedSource } from "../types";

type DocumentViewProps = {
  html: string;
  matches: Match[];
  sources: Record<SourceId, TonedSource>;
  selIdx: number | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onPickMatch: (index: number) => void;
};

/* Reading styles for the server-rendered document HTML. */
const DOC = [
  "font-reading text-[15px] leading-[1.7] text-[#1d1d1d]",
  "[&_p]:mb-4 [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-[22px] [&_h1]:font-semibold [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-[18px] [&_h2]:font-semibold",
  "[&_ul]:mb-[18px] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-[18px] [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_a]:underline [&_img]:mx-auto [&_img]:h-auto [&_img]:max-w-full",
  "[&_figure]:my-6 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:font-sans [&_figcaption]:text-[12px] [&_figcaption]:text-ink-tertiary",
  "[&_table]:mb-[18px] [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_td]:border [&_td]:border-line [&_td]:p-2",
].join(" ");

/* Applied to a matched chunk, tinted with its source's color (--ac / --bg2 / --on). The author badge is a ::before reading data-author. */
const MATCH = [
  "relative -ml-1 mb-4 cursor-pointer rounded-lg border-l-[3px] border-(--ac) bg-(--bg2) px-4 py-3 transition hover:brightness-[.985]",
  "[&>:last-child]:mb-0 data-selected:shadow-[0_0_0_2px_var(--ac),0_6px_20px_rgba(0,0,0,.08)]",
  "before:absolute before:-top-[9px] before:right-2.5 before:rounded-full before:bg-(--ac) before:px-[7px] before:py-px before:font-sans before:text-[10.5px] before:font-bold before:tracking-[.02em] before:text-(--on) before:content-[attr(data-author)]",
].join(" ").split(" ");

export function DocumentView({ html, matches, sources, selIdx, containerRef, onPickMatch }: DocumentViewProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  // Stable object so React only rewrites the DOM when the HTML itself changes.
  const markup = useMemo(() => ({ __html: html }), [html]);

  // Tag each matched chunk with its match index and source colors.
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const tagged = matches.flatMap((m, i) => {
      const el = root.querySelector<HTMLElement>(`[data-chunk-id="${CSS.escape(m.chunkId)}"]`);
      if (!el) return [];
      el.dataset.match = String(i);
      el.dataset.author = sources[m.src].author;
      el.classList.add(...MATCH);
      const { ac, bg2, on } = sources[m.src];
      el.style.setProperty("--ac", ac);
      el.style.setProperty("--bg2", bg2);
      el.style.setProperty("--on", on);
      return [el];
    });
    return () => tagged.forEach(el => {
      delete el.dataset.match;
      delete el.dataset.author;
      el.classList.remove(...MATCH);
      el.style.removeProperty("--ac");
      el.style.removeProperty("--bg2");
      el.style.removeProperty("--on");
    });
  }, [markup, matches, sources]);

  useEffect(() => {
    if (selIdx == null) return;
    const el = bodyRef.current?.querySelector<HTMLElement>(`[data-match="${selIdx}"]`);
    if (!el) return;
    el.dataset.selected = "";
    return () => { delete el.dataset.selected; };
  }, [markup, matches, selIdx]);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-match]");
    if (el) onPickMatch(Number(el.dataset.match));
  }

  return (
    /* relative: makes this the offsetParent so scroll-to-match offsets are measured from here */
    <div className="relative min-h-0 flex-1 overflow-y-auto pt-[34px] pb-20" ref={containerRef}>
      {/* HTML comes from our own document-conversion endpoint; sanitize here if that ever changes. */}
      <div ref={bodyRef} className={`mx-auto max-w-[720px] px-10 ${DOC}`} onClick={handleClick} dangerouslySetInnerHTML={markup} />
    </div>
  );
}
