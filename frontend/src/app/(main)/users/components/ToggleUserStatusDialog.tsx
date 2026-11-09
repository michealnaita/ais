/* Confirms deactivating an active user, or reactivating a deactivated one. */
import { Ban, Check } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "../types";

type ToggleUserStatusDialogProps = {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
};

export function ToggleUserStatusDialog({ user, onClose, onConfirm }: ToggleUserStatusDialogProps) {
  const deact = user.active;
  return (
    <AlertDialog open onOpenChange={open => { if (!open) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>{deact ? <Ban /> : <Check />}</AlertDialogMedia>
          <AlertDialogTitle>{deact ? "Deactivate account?" : "Reactivate account?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {deact
              ? <>“{user.name}” will lose access to AIS immediately. Their submissions and reports are kept. You can reactivate them anytime.</>
              : <>“{user.name}” will regain access to AIS and can sign in again right away.</>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={deact ? "destructive" : "default"} onClick={onConfirm}>{deact ? "Deactivate" : "Reactivate"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
