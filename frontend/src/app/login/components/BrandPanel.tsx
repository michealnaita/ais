import { FeatureItem } from "./FeatureItem";

/* Left-hand marketing panel on the sign-in page; hidden on narrow screens. */
const FEATURES = [
  "Passage-level source matching",
  "Submit once, track every review",
  "Built for students and faculty",
];

export function BrandPanel() {
  return (
    <section className="flex w-[46%] shrink-0 flex-col justify-between border-r border-line bg-panel px-14 py-12 max-[880px]:hidden">
      <img className="block h-7 w-auto self-start" src="/assets/ais_logo.png" alt="AIS" />
      <div className="max-w-[440px]">
        <div className="mb-5 text-[13px] font-semibold tracking-[.08em] text-ink-tertiary uppercase">Academic Integrity System</div>
        <h2 className="font-display text-[52px] leading-[1.04] font-medium tracking-[-0.02em]">Integrity, by&nbsp;default.</h2>
        <p className="mt-[18px] max-w-[400px] text-base leading-[1.6] text-ink-secondary">AIS reviews student coursework for originality and gives instructors a clear, source-linked similarity report.</p>
        <div className="mt-[30px] flex flex-col gap-[13px]">
          {FEATURES.map(f => <FeatureItem key={f}>{f}</FeatureItem>)}
        </div>
      </div>
      <div className="text-[13px] text-ink-tertiary">© 2026 AIS · Your institution’s academic integrity platform</div>
    </section>
  );
}
