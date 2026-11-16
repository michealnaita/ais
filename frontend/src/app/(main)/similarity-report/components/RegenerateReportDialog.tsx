"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useRegenerateReport } from "../actions";

type RegenerateReportDialogProps = {
  submissionId: string;
  threshold: number;
  onClose: () => void;
};

export function RegenerateReportDialog({ submissionId, threshold, onClose }: RegenerateReportDialogProps) {
  const [value, setValue] = useState(String(threshold));
  const regenerate = useRegenerateReport(submissionId);
  const next = Number(value);
  const valid = value.trim() !== "" && Number.isInteger(next) && next >= 0 && next <= 100 && next !== threshold;

  function submit() {
    if (!valid || regenerate.isPending) return;
    regenerate.mutate(next, {
      onSuccess: () => { toast(`Report regenerated with a ${next}% threshold`); onClose(); },
      onError: () => toast("Couldn't regenerate the report. Try again."),
    });
  }

  return (
    <Dialog open onOpenChange={open => { if (!open && !regenerate.isPending) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate report</DialogTitle>
          <DialogDescription>
            Passages at or above the threshold count as matches. Changing it re-runs the analysis and
            recalculates the overall similarity and every source&apos;s share.
          </DialogDescription>
        </DialogHeader>
        <form id="regenerate-report" onSubmit={e => { e.preventDefault(); submit(); }}>
          <Field>
            <FieldLabel htmlFor="report-threshold">Similarity threshold</FieldLabel>
            <InputGroup>
              <InputGroupInput id="report-threshold" type="number" min={0} max={100} step={1} inputMode="numeric"
                autoFocus value={value} disabled={regenerate.isPending} onChange={e => setValue(e.target.value)} />
              <InputGroupAddon align="inline-end"><InputGroupText>%</InputGroupText></InputGroupAddon>
            </InputGroup>
            <FieldDescription>Currently {threshold}%. Enter a whole number from 0 to 100.</FieldDescription>
          </Field>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={regenerate.isPending} />}>Cancel</DialogClose>
          <Button type="submit" form="regenerate-report" disabled={!valid || regenerate.isPending}>
            {regenerate.isPending && <Spinner />} Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
