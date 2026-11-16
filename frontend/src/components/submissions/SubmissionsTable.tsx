import { FileText } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { cn } from "@/utils/cn";
import { RecordCount } from "@/components/RecordCount";
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
  /** Show the assignment under the file name instead of in its own column (for narrow tables). */
  inlineAssignment?: boolean;
  /** Cap the table at its parent's height and scroll only the body (see Table `scrollBody`). */
  scrollBody?: boolean;
  /** Unfiltered total; when set, a record count shows under the table. */
  total?: number;
  onOpen: (submission: Submission) => void;
};

export function SubmissionsTable({ submissions, layout = "student", emptyMessage = "No submissions match this view.", loading, className, inlineAssignment = false, scrollBody = false, total, onOpen }: SubmissionsTableProps) {
  const assignmentColumn = layout !== "compact" && !inlineAssignment;
  const columns = 4 + (layout !== "student" ? 1 : 0) + (assignmentColumn ? 1 : 0);
  return (
    <div className={cn("mt-[18px]", scrollBody && "flex min-h-0 flex-col", className)}>
      <Table scrollBody={scrollBody}>
        <TableHeader>
          <TableRow>
            {layout !== "student" && <TableHead>Student</TableHead>}
            <TableHead>Document</TableHead>
            {assignmentColumn && <TableHead>Assignment</TableHead>}
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
          ) : submissions.map(r => <SubmissionRow key={r.id} submission={r} layout={layout} inlineAssignment={inlineAssignment} onOpen={onOpen} />)}
        </TableBody>
      </Table>
      {total != null && !loading && <RecordCount shown={submissions.length} total={total} noun="submission" />}
    </div>
  );
}
