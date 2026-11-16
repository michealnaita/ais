import { ChevronRight } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { cn } from "@/utils/cn";
import { dueInfo } from "@/utils/due";

type PendingAssignmentItemProps = {
  assignment: Assignment;
  onSelect: (assignment: Assignment) => void;
};

/** One upcoming assignment: a calendar-style date tile, title and enrollment code. */
export function PendingAssignmentItem({ assignment: a, onSelect }: PendingAssignmentItemProps) {
  const due = dueInfo(a.deadline);
  return (
    <button
      type="button"
      className="group/item -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-muted/60"
      onClick={() => onSelect(a)}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
          due.soon ? "bg-amber-bg text-amber-fg" : "bg-muted text-foreground",
        )}
      >
        <span className="text-[10px] font-semibold tracking-wide uppercase opacity-80">{due.month}</span>
        <span className="mt-0.5 text-base font-bold tabular-nums">{due.day}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm leading-[1.3] font-medium text-ink">{a.title}</span>
        <span className="mt-0.5 block text-[12.5px] text-ink-tertiary">
          {a.enrollmentCode}
          {due.soon && <span className="text-amber-fg"> · due soon</span>}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-tertiary transition-transform group-hover/item:translate-x-0.5" />
    </button>
  );
}

export function DueLabel({ deadline }: { deadline: string }) {
  const due = dueInfo(deadline);
  return <span className={cn("shrink-0 text-xs font-semibold whitespace-nowrap", due.soon || due.past ? "text-late" : "text-ink-secondary")}>{due.label}</span>;
}
