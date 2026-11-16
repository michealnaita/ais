import type { ReactNode } from "react";
import { Illustration, type IllustrationName } from "@/components/Illustration";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Assignment } from "@/types/assignment";
import { PendingAssignmentItem } from "./PendingAssignmentItem";

type PendingAssignmentsCardProps = {
  assignments: Assignment[];
  onSelect: (assignment: Assignment) => void;
  title?: string;
  subtitle?: string;
  /** Optional content under the list. */
  footer?: ReactNode;
  /** Decorative illustration in the header, top-right. */
  illustration?: IllustrationName;
};

export function PendingAssignmentsCard({ assignments, onSelect, title = "Assignments", subtitle = "Not yet submitted for review", footer, illustration }: PendingAssignmentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px] font-semibold">{title}</CardTitle>
        <CardDescription>
          <span className="font-semibold text-foreground tabular-nums">{assignments.length}</span> · {subtitle}
        </CardDescription>
        {illustration && (
          <CardAction>
            <Illustration name={illustration} className="-mt-1 h-11 w-auto" />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {assignments.length === 0
          ? <div className="py-5 text-center text-sm text-muted-foreground">Nothing due right now.</div>
          : assignments.map(a => <PendingAssignmentItem key={a.id} assignment={a} onSelect={onSelect} />)}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
