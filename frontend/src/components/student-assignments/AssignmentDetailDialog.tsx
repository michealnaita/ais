"use client";

/* Assignment brief plus file picker to submit work against it. */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { isAcceptedDocument } from "@/services/documents";
import type { Assignment } from "@/types/assignment";
import { AssignmentMetaGrid } from "./AssignmentMetaGrid";
import { FileDropzone } from "./FileDropzone";
import { DueLabel } from "./PendingAssignmentItem";
import { SelectedFileChip } from "./SelectedFileChip";

type AssignmentDetailDialogProps = {
  assignment: Assignment;
  pending?: boolean;
  /** Error from the last submit attempt, shown under the file. */
  error?: string;
  onClose: () => void;
  onSubmit: (file: File) => void;
};

export function AssignmentDetailDialog({ assignment, pending, error, onClose, onSubmit }: AssignmentDetailDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  function pick(f: File) {
    if (!isAcceptedDocument(f)) return setFileError("Only Word documents (.docx) can be submitted.");
    setFileError("");
    setFile(f);
  }

  const shownError = fileError || error;
  return (
    <Dialog open onOpenChange={open => { if (!open && !pending) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{assignment.enrollmentCode}</Badge>
            <DueLabel deadline={assignment.deadline} />
          </div>
          <DialogTitle>{assignment.title}</DialogTitle>
          {assignment.description && <DialogDescription>{assignment.description}</DialogDescription>}
        </DialogHeader>
        <AssignmentMetaGrid assignment={assignment} />
        <Separator />
        <div className="grid gap-3">
          <div className="text-sm font-medium">Submit your work</div>
          {file
            ? <SelectedFileChip file={file} onRemove={() => setFile(null)} />
            : <FileDropzone hint="Word documents (.docx) only" onSelect={pick} />}
          {shownError && <FieldError>{shownError}</FieldError>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancel</DialogClose>
          <Button disabled={!file || pending} onClick={() => file && onSubmit(file)}>
            {pending && <Spinner />} Submit document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
