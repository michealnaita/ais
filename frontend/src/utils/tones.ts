/* Color tones shared by badges, dots and icon chips. Class names are written out
   in full so Tailwind can find them. */
export type Tone = "green" | "blue" | "red" | "amber" | "gray" | "violet";

export const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  green: { bg: "bg-green-bg", fg: "text-green-fg", dot: "bg-green-dot" },
  blue: { bg: "bg-blue-bg", fg: "text-blue-fg", dot: "bg-blue-dot" },
  red: { bg: "bg-red-bg", fg: "text-red-fg", dot: "bg-red-dot" },
  amber: { bg: "bg-amber-bg", fg: "text-amber-fg", dot: "bg-amber-dot" },
  gray: { bg: "bg-gray-bg", fg: "text-gray-fg", dot: "bg-gray-dot" },
  violet: { bg: "bg-violet-bg", fg: "text-violet-fg", dot: "bg-violet-dot" },
};
