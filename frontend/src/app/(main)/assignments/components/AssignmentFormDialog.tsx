"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Assignment, AssignmentFormData, AssignmentStatus } from "@/types/assignment";
import { isoToDisplay } from "@/utils/formatDate";

type AssignmentFormDialogProps = {
  mode: "create" | "edit";
  initial?: Assignment;
  onClose: () => void;
  onSave: (data: AssignmentFormData) => void;
};

export function AssignmentFormDialog({ mode, initial, onClose, onSave }: AssignmentFormDialogProps) {
  const [name, setName] = useState(initial?.name || "");
  const [course, setCourse] = useState(initial?.course || "");
  const [iso, setIso] = useState(initial?.iso || "");
  const [total, setTotal] = useState<string>(initial ? String(initial.total) : "");
  const [status, setStatus] = useState<AssignmentStatus>(initial?.status || "open");

  const valid = name.trim() && course.trim() && iso && Number(total) > 0;

  function submit() {
    if (!valid) return;
    onSave({ name: name.trim(), course, iso, deadline: isoToDisplay(iso), total: Number(total), status });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit assignment" : "Create assignment"}</DialogTitle>
          <DialogDescription>{mode === "edit" ? "Update the assignment details. Changes are visible to enrolled students immediately." : "Set up a new assignment for your students to submit against."}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="assignment-name">Assignment name</FieldLabel>
            <Input id="assignment-name" value={name} autoFocus placeholder="e.g. Essay 4 — Republican Era" onChange={e => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="assignment-course">Course</FieldLabel>
              <Input id="assignment-course" value={course} placeholder="e.g. HIST 304" onChange={e => setCourse(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="assignment-deadline">Deadline</FieldLabel>
              <Input id="assignment-deadline" type="date" value={iso} onChange={e => setIso(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="assignment-total">Enrolled students</FieldLabel>
              <Input id="assignment-total" type="number" min="1" value={total} placeholder="25" onChange={e => setTotal(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="assignment-status">Status</FieldLabel>
              <NativeSelect id="assignment-status" className="w-full" value={status} onChange={e => setStatus(e.target.value as AssignmentStatus)}>
                <NativeSelectOption value="open">Open — accepting submissions</NativeSelectOption>
                <NativeSelectOption value="upcoming">Upcoming — not open yet</NativeSelectOption>
              </NativeSelect>
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!valid} onClick={submit}>{mode === "edit" ? "Save changes" : "Create assignment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
