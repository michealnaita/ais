import { FileIcon } from "@/components/FileIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { formatDate } from "@/utils/formatDate";
import { formatSize } from "@/utils/formatSize";
import { initials } from "@/utils/initials";
import { SimilarityBar } from "./SimilarityBar";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import type { SubmissionsTableLayout } from "./SubmissionsTable";

type SubmissionRowProps = {
  submission: Submission;
  layout: SubmissionsTableLayout;
  inlineAssignment?: boolean;
  onOpen: (submission: Submission) => void;
};

/* Completed rows open the similarity report. */
export function SubmissionRow({ submission: r, layout, inlineAssignment = false, onOpen }: SubmissionRowProps) {
  const complete = r.documentStatus === "processed";
  const size = formatSize(r.documentSize);
  return (
    <TableRow className={complete ? "cursor-pointer" : undefined} onClick={() => { if (complete) onOpen(r); }}>
      {layout !== "student" && (
        <TableCell>
          <div className="flex items-center gap-2.5">
            <Avatar><AvatarFallback>{initials(r.submittedBy)}</AvatarFallback></Avatar>
            <span>{r.submittedBy}</span>
          </div>
        </TableCell>
      )}
      {/* The document column takes the spare width (w-full max-w-0) and long names
          truncate to one line instead of breaking mid-word; hover shows the full name. */}
      <TableCell className="w-full max-w-0 py-3.5">
        <div className="flex items-center gap-3">
          <FileIcon />
          <div className="min-w-0">
            <div className="truncate font-medium" title={r.fileName}>{r.fileName}</div>
            <div className="truncate text-xs text-muted-foreground">{inlineAssignment ? `${r.assignmentTitle} · ${size}` : size}</div>
          </div>
        </div>
      </TableCell>
      {layout !== "compact" && !inlineAssignment && <TableCell className="max-w-[200px] truncate" title={r.assignmentTitle}>{r.assignmentTitle}</TableCell>}
      <TableCell>{formatDate(r.submittedAt)}</TableCell>
      <TableCell><SubmissionStatusBadge status={r.documentStatus} /></TableCell>
      <TableCell><SimilarityBar status={r.documentStatus} score={r.documentSimilarity} /></TableCell>
    </TableRow>
  );
}
