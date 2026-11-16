"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentFormData } from "@/types/assignment";
import { ENROLLMENT_CODE_MAX } from "../constants";

type AssignmentFormDialogProps = {
  pending?: boolean;
  onClose: () => void;
  onSave: (data: AssignmentFormData) => void;
};

/* Creating only: the API has no endpoint for editing an assignment. */
export function AssignmentFormDialog({ pending, onClose, onSave }: AssignmentFormDialogProps) {
  const [title, setTitle] = useState("");
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const valid = title.trim() && enrollmentCode.trim() && deadline;

  function submit() {
    if (!valid) return;
    onSave({
      title: title.trim(),
      enrollmentCode: enrollmentCode.trim(),
      /* datetime-local is the viewer's local time; the API stores UTC. */
      deadline: new Date(deadline).toISOString(),
      description: description.trim() || null,
    });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create assignment</DialogTitle>
          <DialogDescription>Set up a new assignment. You&apos;ll enroll students next.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="assignment-title">Assignment name</FieldLabel>
            <Input id="assignment-title" value={title} autoFocus placeholder="e.g. Essay 4 — Republican Era" onChange={e => setTitle(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="assignment-code">Enrollment code</FieldLabel>
              <Input id="assignment-code" value={enrollmentCode} maxLength={ENROLLMENT_CODE_MAX} placeholder="e.g. HIST304" onChange={e => setEnrollmentCode(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="assignment-deadline">Deadline</FieldLabel>
              <Input id="assignment-deadline" type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="assignment-description">Description <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
            <Textarea id="assignment-description" value={description} rows={4} placeholder="What students should hand in" onChange={e => setDescription(e.target.value)} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!valid || pending} onClick={submit}>Create assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
