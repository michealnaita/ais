"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Role, UserFormData } from "../types";

type UserFormDialogProps = {
  pending?: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
};

const MIN_PASSWORD = 8;

/* Creating only: the API has no endpoint for editing a user. */
export function UserFormDialog({ pending, onClose, onSave }: UserFormDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const valid = firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email) && password.length >= MIN_PASSWORD;

  return (
    <Dialog open onOpenChange={open => { if (!open && !pending) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>Add an account and set its first password. Share it with the user securely.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="user-first-name">First name</FieldLabel>
              <Input id="user-first-name" value={firstName} autoFocus placeholder="e.g. Ada" onChange={e => setFirstName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="user-last-name">Last name</FieldLabel>
              <Input id="user-last-name" value={lastName} placeholder="e.g. Lovelace" onChange={e => setLastName(e.target.value)} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="user-email">Email address</FieldLabel>
            <Input id="user-email" type="email" value={email} placeholder="name@university.edu" onChange={e => setEmail(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="user-password">Password</FieldLabel>
            <Input id="user-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
            <FieldDescription>At least {MIN_PASSWORD} characters.</FieldDescription>
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
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancel</DialogClose>
          <Button disabled={!valid || pending}
            onClick={() => onSave({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, role })}>
            Create user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
