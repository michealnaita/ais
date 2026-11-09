"use client";

/* Join an assignment using an instructor-shared enrollment code. */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEnrollWithCode } from "@/hooks/useEnrolledAssignments";
import { normalizeCode } from "@/services/enrollment";
import type { EnrolledAssignment } from "@/types/enrolledAssignment";

type AddAssignmentDialogProps = {
  onClose: () => void;
  onEnroll: (assignment: EnrolledAssignment) => void;
};

export function AddAssignmentDialog({ onClose, onEnroll }: AddAssignmentDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const enrollment = useEnrollWithCode();

  function enroll() {
    if (!normalizeCode(code) || enrollment.isPending) return;
    enrollment.mutate(code, {
      onSuccess: onEnroll,
      onError: e => setError(e.message),
    });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an assignment</DialogTitle>
          <DialogDescription>Enter the enrollment code your instructor shared to join an assignment.</DialogDescription>
        </DialogHeader>
        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor="code">Enrollment code</FieldLabel>
          <Input
            id="code"
            className="font-mono uppercase"
            value={code}
            autoFocus
            maxLength={12}
            placeholder="HIST-7F3K"
            aria-invalid={!!error}
            onChange={e => { setCode(e.target.value); setError(""); }}
            onKeyDown={e => { if (e.key === "Enter") enroll(); }}
          />
          {error
            ? <FieldError>{error}</FieldError>
            : <FieldDescription>Try a code from your instructor — e.g. HIST-7F3K or HIST-92QD</FieldDescription>}
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={enroll} disabled={!code.trim() || enrollment.isPending}>{enrollment.isPending ? "Joining…" : "Join assignment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
