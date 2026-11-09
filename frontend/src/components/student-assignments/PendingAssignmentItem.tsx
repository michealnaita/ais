import type { EnrolledAssignment } from "@/types/enrolledAssignment";
import { cn } from "@/utils/cn";

type PendingAssignmentItemProps = {
  assignment: EnrolledAssignment;
  onSelect: (assignment: EnrolledAssignment) => void;
};

export function PendingAssignmentItem({ assignment: a, onSelect }: PendingAssignmentItemProps) {
  return (
    <div
      className="-mx-2 flex cursor-pointer items-center gap-[13px] rounded-[9px] border-t border-line px-2 py-[13px] transition-colors hover:bg-subtle"
      onClick={() => onSelect(a)}
    >
      <span className={cn("size-[9px] shrink-0 rounded-full border-2", a.soon ? "border-[#d9886a] bg-[#fbeae2]" : "border-line-strong bg-white")} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm leading-[1.3] font-medium text-ink">{a.name}</div>
        <div className="mt-0.5 text-[12.5px] text-ink-tertiary">{a.course}</div>
      </div>
      <DueLabel due={a.due} soon={a.soon} />
    </div>
  );
}

export function DueLabel({ due, soon }: { due: string; soon: boolean }) {
  return <span className={cn("shrink-0 text-xs font-semibold whitespace-nowrap", soon ? "text-late" : "text-ink-secondary")}>{due}</span>;
}
