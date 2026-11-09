"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Role, User, UserFormData } from "../types";

type UserFormDialogProps = {
  mode: "create" | "edit";
  initial?: User;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
};

export function UserFormDialog({ mode, initial, onClose, onSave }: UserFormDialogProps) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [role, setRole] = useState<Role>(initial?.role || "student");
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>{mode === "edit"
            ? "Update this user's details and role. Changes take effect immediately."
            : "Add a user manually. They'll receive an email to set their password."}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="user-name">Full name</FieldLabel>
            <Input id="user-name" value={name} autoFocus placeholder="e.g. Ada Lovelace" onChange={e => setName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="user-email">Email address</FieldLabel>
            <Input id="user-email" type="email" value={email} placeholder="name@university.edu" onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="user-role">Role</FieldLabel>
            <NativeSelect id="user-role" className="w-full" value={role} onChange={e => setRole(e.target.value as Role)}>
              <NativeSelectOption value="student">Student</NativeSelectOption>
              <NativeSelectOption value="instructor">Instructor</NativeSelectOption>
              <NativeSelectOption value="admin">Administrator</NativeSelectOption>
            </NativeSelect>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!valid} onClick={() => onSave({ name: name.trim(), email: email.trim(), role })}>
            {mode === "edit" ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
