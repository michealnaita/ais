"use client";

/* Instructor enrolls students in an assignment by typing each student's email and
   pressing Enter; every email becomes a chip. The API only adds students, so the
   current roster is listed read-only and removing someone isn't available yet. */
import { Fragment, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { NotAvailable } from "@/components/NotAvailable";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxValue } from "@/components/ui/combobox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { isApiError } from "@/lib/api";
import type { Assignment } from "@/types/assignment";
import { useEnrollStudents } from "../actions";
import { useAssignmentEnrollments } from "../queries";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EnrollStudentsDialogProps = {
  assignment: Assignment;
  onClose: () => void;
};

export function EnrollStudentsDialog({ assignment: a, onClose }: EnrollStudentsDialogProps) {
  const enrollments = useAssignmentEnrollments(a.id);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Enroll students</DialogTitle>
          <DialogDescription>
            {a.title} · {a.enrollmentCode}. Enrolled students see the assignment on their dashboard and can submit to it.
          </DialogDescription>
        </DialogHeader>
        {enrollments.data ? (
          <EnrollForm assignment={a} enrolled={enrollments.data.map(s => s.email.toLowerCase())} onDone={onClose} />
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground"><Spinner /></div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EnrollForm({ assignment: a, enrolled, onDone }: { assignment: Assignment; enrolled: string[]; onDone: () => void }) {
  const enroll = useEnrollStudents(a.id);
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function add(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const email = draft.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL.test(email)) return setError(`“${email}” isn't a valid email address.`);
    if (enrolled.includes(email) || emails.includes(email)) return setError(`${email} is already enrolled.`);
    setEmails([...emails, email]);
    setDraft("");
    setError("");
  }

  function save() {
    enroll.mutate(emails, {
      onSuccess: ({ enrolled: added, alreadyEnrolled }) => {
        toast.success(`${added.length} student${added.length === 1 ? "" : "s"} enrolled in “${a.title}”`);
        if (alreadyEnrolled.length) toast.info(`Already enrolled: ${alreadyEnrolled.join(", ")}`);
        onDone();
      },
      onError: err => {
        const unknown = isApiError(err, 400) ? (err.detail as { emails?: string[] } | undefined)?.emails : undefined;
        if (unknown?.length) setError(`No student account for ${unknown.join(", ")}. Nobody was enrolled.`);
        else toast.error("Couldn't update enrollment. Try again.");
      },
    });
  }

  return (
    <>
      {enrolled.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            Enrolled ({enrolled.length})
            <NotAvailable><Button variant="link" size="sm" disabled>Remove students</Button></NotAvailable>
          </div>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {enrolled.map(email => (
              <span key={email} title={email} className="max-w-[220px] truncate rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{email}</span>
            ))}
          </div>
        </div>
      )}
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="enroll-email">Add students by email</FieldLabel>
        {/* Chips only: the combobox popup is kept closed, emails are typed in full. */}
        <Combobox
          multiple
          open={false}
          items={[]}
          value={emails}
          onValueChange={(v: string[]) => { setEmails(v); setError(""); }}
          inputValue={draft}
          onInputValueChange={v => { setDraft(v); setError(""); }}
        >
          <ComboboxChips className="max-h-48 w-full overflow-y-auto">
            <ComboboxValue>
              {(values: string[]) => (
                <Fragment>
                  {values.map(email => (
                    <ComboboxChip key={email} title={email} className="max-w-[220px]">
                      <span className="min-w-0 truncate">{email}</span>
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    id="enroll-email"
                    type="email"
                    autoComplete="off"
                    aria-invalid={!!error || undefined}
                    placeholder={values.length ? "Add another email" : "student@university.edu"}
                    onKeyDown={add}
                  />
                </Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
        </Combobox>
        {error ? (
          <FieldError>{error}</FieldError>
        ) : (
          <FieldDescription>
            Press Enter to add each email ·{" "}
            <span className="font-medium text-foreground tabular-nums">{emails.length}</span> to enroll
          </FieldDescription>
        )}
      </Field>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button disabled={emails.length === 0 || enroll.isPending} onClick={save}>
          {enroll.isPending && <Spinner />} Enroll students
        </Button>
      </DialogFooter>
    </>
  );
}
