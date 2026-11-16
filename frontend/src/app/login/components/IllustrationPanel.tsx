import { Illustration } from "@/components/Illustration";

/* Right half of the sign-in page; hidden on narrow screens. */
export function IllustrationPanel() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-10 bg-panel p-12 max-[880px]:hidden">
      <Illustration name="on-the-laptop" eager className="h-auto w-full max-w-[420px]" />
      <div className="max-w-[400px] text-center">
        <h2 className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.01em]">Integrity, by&nbsp;default.</h2>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-secondary">
          Submit coursework and review clear, source-linked similarity reports in one place.
        </p>
      </div>
    </section>
  );
}
