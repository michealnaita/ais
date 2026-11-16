/* Shared height for the document card header and the score card header, so their
   bottom borders line up across the two floating cards. */
export const CARD_HEADER = "flex h-[84px] shrink-0 items-center border-b border-line";

/* Highlight colors for similar documents. A document at index i (most-matched first) gets
   SOURCE_COLORS[i % SOURCE_COLORS.length]. Each is dark enough for white badge text (≥ 4.5:1);
   its tinted background is derived in sourceTone(). */
export const SOURCE_COLORS = [
  "#2f4b8a", // ink blue
  "#5b3bc4", // violet
  "#2f5d4e", // chalkboard green
  "#8a5a00", // ochre
  "#0f6e7a", // teal
  "#a3366b", // plum
  "#4d6b1f", // olive
  "#1f6f9f", // steel blue
  "#7a4a2a", // umber
  "#6b4fa3", // lavender
  "#9a4d12", // rust
  "#34607a", // slate
  "#7d3c98", // purple
  "#2e7d6b", // jade
  "#8c3a4b", // wine
  "#55606e", // graphite
] as const;
