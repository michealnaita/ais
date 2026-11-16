import { ClipboardList } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assignment } from "@/types/assignment";
import { RecordCount } from "@/components/RecordCount";
import type { AssignmentAction } from "../types";
import { AssignmentRow } from "./AssignmentRow";

type AssignmentsTableProps = {
  assignments: Assignment[];
  loading?: boolean;
  /** Unfiltered total, for the record count under the table. */
  total: number;
  onAction: (assignment: Assignment, action: AssignmentAction) => void;
};

export function AssignmentsTable({ assignments, loading, total, onAction }: AssignmentsTableProps) {
  return (
    /* Fills what the page leaves and scrolls only the body (the page uses PageContainer `fill`). */
    <div className="mt-4 flex min-h-0 flex-col">
      <Table scrollBody>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment</TableHead>
            <TableHead>Enrollment code</TableHead>
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
      {!loading && <RecordCount shown={assignments.length} total={total} noun="assignment" />}
    </div>
  );
}
