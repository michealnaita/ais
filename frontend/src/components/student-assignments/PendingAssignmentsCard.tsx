import type { ReactNode } from "react";
import type { EnrolledAssignment } from "@/types/enrolledAssignment";
import { PendingAssignmentItem } from "./PendingAssignmentItem";

type PendingAssignmentsCardProps = {
  assignments: EnrolledAssignment[];
  onSelect: (assignment: EnrolledAssignment) => void;
  title?: string;
  subtitle?: string;
  /** Shown under the list, e.g. an "Add assignment" button. */
  footer?: ReactNode;
};

export function PendingAssignmentsCard({ assignments, onSelect, title = "Assignments", subtitle = "Not yet submitted for review", footer }: PendingAssignmentsCardProps) {
  return (
    <div className="rounded-2xl border border-line-strong px-5 pt-5 pb-3.5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        <span className="min-w-[22px] rounded-full bg-black/5 px-2 py-0.5 text-center text-xs font-semibold text-ink-secondary">{assignments.length}</span>
      </div>
      <div className="mb-1.5 text-[12.5px] text-ink-tertiary">{subtitle}</div>
      {assignments.length === 0
        ? <div className="border-t border-line py-5 text-center text-[13px] text-ink-tertiary">Nothing due right now.</div>
        : assignments.map(a => <PendingAssignmentItem key={a.id} assignment={a} onSelect={onSelect} />)}
      {footer && <div className="border-t border-line pt-3.5 pb-1.5">{footer}</div>}
    </div>
  );
}
