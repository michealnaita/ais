import { TriangleAlert } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Assignment } from "@/types/assignment";

type DeleteAssignmentDialogProps = {
  assignment: Assignment;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAssignmentDialog({ assignment: a, onClose, onConfirm }: DeleteAssignmentDialogProps) {
  return (
    <AlertDialog open onOpenChange={open => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><TriangleAlert /></AlertDialogMedia>
          <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
          <AlertDialogDescription>
            “{a.name}” and all {a.submitted} received submission{a.submitted === 1 ? "" : "s"} will be permanently removed. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>Delete assignment</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
