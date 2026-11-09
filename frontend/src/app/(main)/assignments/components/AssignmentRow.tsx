import { FileText } from "lucide-react";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { RowIcon, TitleCell } from "@/components/TitleCell";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Assignment } from "@/types/assignment";
import { TODAY_ISO } from "../constants";
import type { AssignmentAction } from "../types";
import { AssignmentRowMenu } from "./AssignmentRowMenu";

type AssignmentRowProps = {
  assignment: Assignment;
  onAction: (action: AssignmentAction) => void;
};

export function AssignmentRow({ assignment: a, onAction }: AssignmentRowProps) {
  const pastDue = a.iso < TODAY_ISO && a.status !== "closed";
  return (
    <TableRow>
      <TableCell><TitleCell icon={<RowIcon><FileText size={18} /></RowIcon>} title={a.name} caption={`AIS-${String(a.id).slice(-4)}`} /></TableCell>
      <TableCell>{a.course}</TableCell>
      <TableCell className={pastDue ? "text-late" : undefined}>{a.deadline}</TableCell>
      <TableCell>{a.submitted} submission{a.submitted === 1 ? "" : "s"}</TableCell>
      <TableCell><AssignmentStatusBadge status={a.status} /></TableCell>
      <TableCell><AssignmentRowMenu assignment={a} onAction={onAction} /></TableCell>
    </TableRow>
  );
}
