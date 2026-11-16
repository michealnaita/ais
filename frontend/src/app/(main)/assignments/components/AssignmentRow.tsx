import { Folder } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { RowIcon, TitleCell } from "@/components/TitleCell";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Assignment } from "@/types/assignment";
import { dueInfo } from "@/utils/due";
import { formatDate } from "@/utils/formatDate";
import type { AssignmentAction } from "../types";
import { AssignmentRowMenu } from "./AssignmentRowMenu";

type AssignmentRowProps = {
  assignment: Assignment;
  onAction: (action: AssignmentAction) => void;
};

export function AssignmentRow({ assignment: a, onAction }: AssignmentRowProps) {
  const pastDue = dueInfo(a.deadline).past && a.status !== "closed";
  const submitted = a.submissionCount ?? 0;
  const enrolled = a.enrollmentCount ?? 0;
  return (
    <TableRow className="cursor-pointer" onClick={() => onAction("view")}>
      <TableCell><TitleCell icon={<RowIcon><Folder size={18} /></RowIcon>} title={a.title} caption={`AIS-${a.id.slice(0, 6).toUpperCase()}`} /></TableCell>
      <TableCell className="font-mono text-[13px]">{a.enrollmentCode}</TableCell>
      <TableCell className={pastDue ? "text-late" : undefined}>{formatDate(a.deadline)}</TableCell>
      <TableCell>{submitted} of {enrolled} submitted</TableCell>
      <TableCell><AssignmentStatusBadge status={a.status} /></TableCell>
      {/* Keep menu clicks from also opening the row. */}
      <TableCell onClick={e => e.stopPropagation()}><AssignmentRowMenu assignment={a} onAction={onAction} /></TableCell>
    </TableRow>
  );
}
