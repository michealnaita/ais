import { FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RowIcon, TitleCell } from "@/components/TitleCell";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import type { Job } from "../types";
import { JobProgressBar } from "./JobProgressBar";

type JobRowProps = {
  job: Job;
  onRetry: (job: Job) => void;
};

export function JobRow({ job, onRetry }: JobRowProps) {
  return (
    <TableRow className={cn(job.status === "complete" && "text-muted-foreground")}>
      <TableCell><TitleCell icon={<RowIcon><FileText size={18} /></RowIcon>} title={job.file} caption={job.assignment} /></TableCell>
      <TableCell>{job.owner}</TableCell>
      <TableCell>
        <SubmissionStatusBadge status={job.status} />
        {job.status === "processing" && <JobProgressBar progress={job.progress ?? 0} />}
        {job.status === "failed" && job.err && <div className="mt-1 text-xs text-destructive">{job.err}</div>}
      </TableCell>
      <TableCell>{job.queued}</TableCell>
      <TableCell className="text-right">
        {job.status === "failed"
          ? <Button variant="outline" size="sm" onClick={() => onRetry(job)}><RotateCcw size={16} /> Retry</Button>
          : <span className="text-muted-foreground">—</span>}
      </TableCell>
    </TableRow>
  );
}
