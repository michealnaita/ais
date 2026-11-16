import { NotAvailable } from "@/components/NotAvailable";
import type { Assignment } from "@/types/assignment";
import { formatDateTime } from "@/utils/formatDate";

/* Instructor, length and size limits aren't in the API yet: shown as disabled placeholders. */
export function AssignmentMetaGrid({ assignment: a }: { assignment: Assignment }) {
  const missing = <NotAvailable><span className="text-muted-foreground">—</span></NotAvailable>;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-[18px] [&_dd]:text-sm [&_dd]:font-medium [&_dd]:text-ink [&_dt]:mb-[3px] [&_dt]:text-xs [&_dt]:text-ink-tertiary">
      <div><dt>Deadline</dt><dd>{formatDateTime(a.deadline)}</dd></div>
      <div><dt>Accepted files</dt><dd>Word (.docx)</dd></div>
      <div><dt>Instructor</dt><dd>{missing}</dd></div>
      <div><dt>Length</dt><dd>{missing}</dd></div>
    </dl>
  );
}
