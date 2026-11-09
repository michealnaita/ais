"use client";

import { Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportRoute } from "@/lib/routes";
import type { Assignment } from "@/types/assignment";
import { useAssignmentSubmissions } from "../queries";
import { StudentSubmissionRow } from "./StudentSubmissionRow";

type ViewSubmissionsDialogProps = {
  assignment: Assignment;
  onClose: () => void;
};

export function ViewSubmissionsDialog({ assignment: a, onClose }: ViewSubmissionsDialogProps) {
  const router = useRouter();
  const { data: subs = [], isPending } = useAssignmentSubmissions(a.name);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{a.course}</Badge>
            <AssignmentStatusBadge status={a.status} />
          </div>
          <DialogTitle>{a.name}</DialogTitle>
          <DialogDescription>{a.submitted} of {a.total} enrolled students submitted · Deadline {a.deadline}</DialogDescription>
        </DialogHeader>
        {subs.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
              <EmptyTitle>{isPending ? "Loading submissions…" : "No submissions received yet."}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="max-h-[50vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Similarity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map(s => <StudentSubmissionRow key={s.id} submission={s} onOpen={s => router.push(reportRoute(s.id))} />)}
              </TableBody>
            </Table>
          </div>
        )}
        <DialogFooter>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
