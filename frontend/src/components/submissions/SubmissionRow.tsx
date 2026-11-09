import { FileIcon } from "@/components/FileIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { initials } from "@/utils/initials";
import { SimilarityBar } from "./SimilarityBar";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import type { SubmissionsTableLayout } from "./SubmissionsTable";

type SubmissionRowProps = {
  submission: Submission;
  layout: SubmissionsTableLayout;
  onOpen: (submission: Submission) => void;
};

/* Completed rows open the similarity report. */
export function SubmissionRow({ submission: r, layout, onOpen }: SubmissionRowProps) {
  const complete = r.status === "complete";
  return (
    <TableRow className={complete ? "cursor-pointer" : undefined} onClick={() => { if (complete) onOpen(r); }}>
      {layout !== "student" && (
        <TableCell>
          <div className="flex items-center gap-2.5">
            <Avatar><AvatarFallback>{initials(r.student)}</AvatarFallback></Avatar>
            <span>{r.student}</span>
          </div>
        </TableCell>
      )}
      {/* Names wrap so the table fits narrow columns instead of scrolling sideways. */}
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-3">
          <FileIcon />
          <div>
            <div className="font-medium wrap-anywhere">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.size}</div>
          </div>
        </div>
      </TableCell>
      {layout !== "compact" && <TableCell className="whitespace-normal">{r.assignment}</TableCell>}
      <TableCell>{r.date}</TableCell>
      <TableCell><SubmissionStatusBadge status={r.status} /></TableCell>
      <TableCell><SimilarityBar status={r.status} score={r.score} /></TableCell>
    </TableRow>
  );
}
