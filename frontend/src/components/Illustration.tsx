import Image from "next/image";
import { cn } from "@/utils/cn";

/* Notion-style line illustrations in public/illustrations (Overflow Design, Regular style). */
const ILLUSTRATIONS = {
  "design-proposal": { width: 281, height: 150 },
  growing: { width: 321, height: 301 },
  lighthouse: { width: 240, height: 151 },
  "on-the-laptop": { width: 422, height: 401 },
  "project-development": { width: 298, height: 251 },
  "scale-a-process": { width: 254, height: 151 },
  target: { width: 186, height: 150 },
  "time-flies": { width: 213, height: 151 },
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;

/** Decorative illustration; size it with a height class, e.g. `h-20 w-auto`. Inverted in dark mode. */
export function Illustration({ name, className, eager }: { name: IllustrationName; className?: string; eager?: boolean }) {
  const { width, height } = ILLUSTRATIONS[name];
  return (
    <Image
      src={`/illustrations/${name}.svg`}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      loading={eager ? "eager" : undefined}
      className={cn("pointer-events-none select-none dark:invert", className)}
    />
  );
}

/** Illustration tucked into the bottom-right corner of a `relative` card. Render it first so `relative` card parts paint over it. */
export function CornerIllustration({ name, className }: { name: IllustrationName; className?: string }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute right-4 bottom-3 max-sm:hidden">
      <Illustration name={name} className={cn("h-[72px] w-auto", className)} />
    </span>
  );
}
