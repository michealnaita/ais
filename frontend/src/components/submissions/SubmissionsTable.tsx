import { FileText } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { cn } from "@/utils/cn";
import { SubmissionRow } from "./SubmissionRow";

/* "instructor" and "compact" add a Student column; "compact" drops Assignment. */
export type SubmissionsTableLayout = "student" | "instructor" | "compact";

type SubmissionsTableProps = {
  submissions: Submission[];
  layout?: SubmissionsTableLayout;
  emptyMessage?: string;
  /** Still fetching: show a loading message instead of the empty state. */
  loading?: boolean;
  className?: string;
  onOpen: (submission: Submission) => void;
};

export function SubmissionsTable({ submissions, layout = "student", emptyMessage = "No submissions match this view.", loading, className, onOpen }: SubmissionsTableProps) {
  const columns = 4 + (layout !== "student" ? 1 : 0) + (layout !== "compact" ? 1 : 0);
  return (
    <div className={cn("mt-[18px]", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {layout !== "student" && <TableHead>Student</TableHead>}
            <TableHead>Document</TableHead>
            {layout !== "compact" && <TableHead>Assignment</TableHead>}
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Similarity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns}>
                <Empty><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>{loading ? "Loading submissions…" : emptyMessage}</EmptyTitle></EmptyHeader></Empty>
              </TableCell>
            </TableRow>
          ) : submissions.map(r => <SubmissionRow key={r.id} submission={r} layout={layout} onOpen={onOpen} />)}
        </TableBody>
      </Table>
    </div>
  );
}
