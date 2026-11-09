import { ClipboardList } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assignment } from "@/types/assignment";
import type { AssignmentAction } from "../types";
import { AssignmentRow } from "./AssignmentRow";

type AssignmentsTableProps = {
  assignments: Assignment[];
  loading?: boolean;
  onAction: (assignment: Assignment, action: AssignmentAction) => void;
};

export function AssignmentsTable({ assignments, loading, onAction }: AssignmentsTableProps) {
  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Assignment</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Submissions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <Empty><EmptyHeader><EmptyMedia variant="icon"><ClipboardList /></EmptyMedia><EmptyTitle>{loading ? "Loading assignments…" : "No assignments match this view."}</EmptyTitle></EmptyHeader></Empty>
            </TableCell>
          </TableRow>
        ) : assignments.map(a => (
          <AssignmentRow key={a.id} assignment={a} onAction={t => onAction(a, t)} />
        ))}
      </TableBody>
    </Table>
  );
}
