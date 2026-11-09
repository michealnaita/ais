"use client";

/* Assignment brief plus file picker to submit work against it. */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { EnrolledAssignment, NewSubmission, SelectedFile } from "@/types/enrolledAssignment";
import { formatSize } from "@/utils/formatSize";
import { AssignmentMetaGrid } from "./AssignmentMetaGrid";
import { FileDropzone } from "./FileDropzone";
import { DueLabel } from "./PendingAssignmentItem";
import { SelectedFileChip } from "./SelectedFileChip";

type AssignmentDetailDialogProps = {
  assignment: EnrolledAssignment;
  onClose: () => void;
  onSubmit: (submission: NewSubmission) => void;
};

export function AssignmentDetailDialog({ assignment, onClose, onSubmit }: AssignmentDetailDialogProps) {
  const [file, setFile] = useState<SelectedFile | null>(null);

  function pick(f: File) {
    const ext = (f.name.split(".").pop() || "txt").toLowerCase();
    setFile({ name: f.name, size: formatSize(f.size), ext });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{assignment.course}</Badge>
            <DueLabel due={assignment.due} soon={assignment.soon} />
          </div>
          <DialogTitle>{assignment.name}</DialogTitle>
          <DialogDescription>{assignment.description}</DialogDescription>
        </DialogHeader>
        <AssignmentMetaGrid assignment={assignment} />
        <Separator />
        <div className="grid gap-3">
          <div className="text-sm font-medium">Submit your work</div>
          {file
            ? <SelectedFileChip file={file} onRemove={() => setFile(null)} />
            : <FileDropzone hint={`${assignment.fileTypes} · up to ${assignment.maxSize}`} onSelect={pick} />}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!file} onClick={() => file && onSubmit({ ...file, assignment: assignment.name })}>
            Submit document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
