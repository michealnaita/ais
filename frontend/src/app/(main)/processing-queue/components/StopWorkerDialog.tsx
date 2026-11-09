import { TriangleAlert } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type StopWorkerDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export function StopWorkerDialog({ onClose, onConfirm }: StopWorkerDialogProps) {
  return (
    <AlertDialog open onOpenChange={open => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><TriangleAlert /></AlertDialogMedia>
          <AlertDialogTitle>Stop the background worker?</AlertDialogTitle>
          <AlertDialogDescription>
            Pending and incoming documents won’t be processed until the worker is restarted. Jobs already running may be interrupted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>Stop worker</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
