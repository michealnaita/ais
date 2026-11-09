"use client";

/* Join-by-code and assignment-detail dialogs, driven by useEnrolledAssignments(). */
import { AddAssignmentDialog } from "./AddAssignmentDialog";
import { AssignmentDetailDialog } from "./AssignmentDetailDialog";
import type { EnrolledAssignment, NewSubmission } from "@/types/enrolledAssignment";
import type { useEnrolledAssignments } from "@/hooks/useEnrolledAssignments";

type StudentAssignmentDialogsProps = {
  state: ReturnType<typeof useEnrolledAssignments>;
  onEnrolled: (assignment: EnrolledAssignment) => void;
  onSubmit: (submission: NewSubmission) => void;
};

export function StudentAssignmentDialogs({ state, onEnrolled, onSubmit }: StudentAssignmentDialogsProps) {
  const { addOpen, setAddOpen, detail, setDetail } = state;
  return (
    <>
      {addOpen && (
        <AddAssignmentDialog onClose={() => setAddOpen(false)}
          onEnroll={a => { setAddOpen(false); onEnrolled(a); }} />
      )}
      {detail && (
        <AssignmentDetailDialog assignment={detail} onClose={() => setDetail(null)}
          onSubmit={doc => { setDetail(null); onSubmit(doc); }} />
      )}
    </>
  );
}
