/* Colour overrides for status badges, layered over the shadcn Badge variant via
   className. `--badge-dot` sets the colour of the Badge `dot`. Class names are written
   out in full so Tailwind can find them. */
import type { AssignmentStatus } from "@/types/assignment";
import type { SubmissionStatus } from "./submissionStatus";

/** Pill size for status badges: larger than the stock Badge, with a 7px dot. */
export const STATUS_BADGE_SIZE = "h-[27px] gap-[7px] pr-[11px] pl-[9px] text-[13px] font-semibold [&_[data-slot=badge-dot]]:size-[7px]";

const GREEN = "bg-green-bg text-green-fg [--badge-dot:var(--color-green-dot)]";
const BLUE = "bg-blue-bg text-blue-fg [--badge-dot:var(--color-blue-dot)]";
const RED = "bg-red-bg text-red-fg [--badge-dot:var(--color-red-dot)]";
const GRAY = "bg-gray-bg text-gray-fg [--badge-dot:var(--color-gray-dot)]";

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  complete: GREEN,
  processing: BLUE,
  failed: RED,
  pending: GRAY,
};

export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, string> = {
  open: GREEN,
  upcoming: BLUE,
  closed: GRAY,
};
