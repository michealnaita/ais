import { Layers } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Job } from "../types";
import { JobRow } from "./JobRow";

type JobsTableProps = {
  jobs: Job[];
  onRetry: (job: Job) => void;
};

export function JobsTable({ jobs, onRetry }: JobsTableProps) {
  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Submitted by</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Queued</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5}><Empty><EmptyHeader><EmptyMedia variant="icon"><Layers /></EmptyMedia><EmptyTitle>No jobs in this view.</EmptyTitle></EmptyHeader></Empty></TableCell>
          </TableRow>
        ) : jobs.map(j => <JobRow key={j.id} job={j} onRetry={onRetry} />)}
      </TableBody>
    </Table>
  );
}
