/* Confirms deactivating an active user. */
import { Ban } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "../types";
import { fullName } from "../utils";

type ToggleUserStatusDialogProps = {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
};

export function ToggleUserStatusDialog({ user, onClose, onConfirm }: ToggleUserStatusDialogProps) {
  return (
    <AlertDialog open onOpenChange={open => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Ban /></AlertDialogMedia>
          <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
          <AlertDialogDescription>
            “{fullName(user)}” will lose access to AIS. Their submissions and reports are kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>Deactivate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
