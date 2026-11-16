"use client";

/* Student uploads a new version of their submission. Submitting again to the same
   assignment replaces the earlier submission (and deletes its document). */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/student-assignments/FileDropzone";
import { SelectedFileChip } from "@/components/student-assignments/SelectedFileChip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmitDocument } from "@/hooks/useSubmissions";
import { ROUTES } from "@/lib/routes";
import { isAcceptedDocument } from "@/services/documents";
import type { SubmissionDetail } from "@/types/api";

type ReplaceSubmissionDialogProps = {
  submission: SubmissionDetail;
  onClose: () => void;
};

export function ReplaceSubmissionDialog({ submission, onClose }: ReplaceSubmissionDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const replace = useSubmitDocument();
  /* The submission only carries the assignment's title; find its id among the student's assignments. */
  const { data: assignments, isPending: assignmentsPending } = useAssignments();
  const matches = assignments?.filter(a => a.title === submission.assignmentTitle) ?? [];
  const assignment = matches.length === 1 ? matches[0] : undefined;

  const blocked = !assignmentsPending && (!assignment
    ? "Couldn't find this submission's assignment, so it can't be replaced here."
    : assignment.status !== "open" ? "This assignment is closed and no longer accepts submissions." : "");

  function pick(f: File) {
    if (!isAcceptedDocument(f)) return setFileError("Only Word documents (.docx) can be submitted.");
    setFileError("");
    setFile(f);
  }

  function submit() {
    if (!file || !assignment || replace.isPending) return;
    replace.mutate({ assignmentId: assignment.id, file }, {
      onSuccess: () => {
        toast(`${file.name} submitted — a new report will be ready once analysis finishes`);
        // This report no longer applies; the submissions list shows the new analysis progress.
        router.push(ROUTES.submissions);
      },
    });
  }

  const error = blocked || fileError || replace.error?.message;
  return (
    <Dialog open onOpenChange={open => { if (!open && !replace.isPending) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Replace submission</DialogTitle>
          <DialogDescription>
            Upload a new version for {submission.assignmentTitle}. It replaces <b className="font-medium text-ink">{submission.fileName}</b> and
            is analysed again, so this report will be replaced by a new one.
          </DialogDescription>
        </DialogHeader>
        {file
          ? <SelectedFileChip file={file} onRemove={() => setFile(null)} />
          : <FileDropzone hint="Word documents (.docx) only" onSelect={pick} />}
        {error && <FieldError>{error}</FieldError>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={replace.isPending} />}>Cancel</DialogClose>
          <Button disabled={!file || !assignment || !!blocked || replace.isPending} onClick={submit}>
            {replace.isPending && <Spinner />} Replace document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
