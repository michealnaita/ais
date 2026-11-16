"use client";

/* The assignment-detail dialog for one of the student's assignments, wired to submitting. */
import { toast } from "sonner";
import { useSubmitDocument } from "@/hooks/useSubmissions";
import type { Assignment } from "@/types/assignment";
import { AssignmentDetailDialog } from "./AssignmentDetailDialog";

type StudentAssignmentDialogsProps = {
  /** The assignment whose dialog is open, if any. */
  assignment: Assignment | null;
  onClose: () => void;
};

export function StudentAssignmentDialogs({ assignment, onClose }: StudentAssignmentDialogsProps) {
  const submit = useSubmitDocument();
  if (!assignment) return null;
  return (
    <AssignmentDetailDialog
      key={assignment.id}
      assignment={assignment}
      pending={submit.isPending}
      error={submit.error?.message}
      onClose={() => { submit.reset(); onClose(); }}
      onSubmit={file => submit.mutate({ assignmentId: assignment.id, file }, {
        onSuccess: () => {
          toast.success(`“${file.name}” submitted to ${assignment.title}`);
          submit.reset();
          onClose();
        },
      })}
    />
  );
}
