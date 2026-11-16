"use client";

/* One assignment's submissions: the shared submissions screen, scoped to this assignment. */
import { ClipboardList, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AssignmentStatusBadge } from "@/components/assignments/AssignmentStatusBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubmissionsPage } from "@/components/submissions/SubmissionsPage";
import { Button, buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useAssignments } from "@/hooks/useAssignments";
import { ROUTES } from "@/lib/routes";
import { useAssignmentSubmissions } from "@/hooks/useSubmissions";
import { formatDate } from "@/utils/formatDate";
import { EnrollStudentsDialog } from "./EnrollStudentsDialog";

const BACK = { href: ROUTES.assignments, label: "Assignments" };

export function AssignmentSubmissions({ id }: { id: string }) {
  const { data: assignments, isPending } = useAssignments();
  const assignment = assignments?.find(a => a.id === id);
  const submissions = useAssignmentSubmissions(assignment?.id);
  const [enrolling, setEnrolling] = useState(false);

  if (isPending) return <div className="flex-1" />;

  if (!assignment) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
            <EmptyTitle>This assignment doesn&apos;t exist.</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Link className={buttonVariants({ variant: "link" })} href={ROUTES.assignments}>Back to assignments</Link>
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  const a = assignment;
  return (
    <>
      <SubmissionsPage
        submissions={submissions.data ?? []}
        loading={submissions.isPending}
        title={a.title}
        subtitle={`${a.enrollmentCode} · ${a.submissionCount ?? 0} of ${a.enrollmentCount ?? 0} students submitted · Due ${formatDate(a.deadline)}`}
        back={BACK}
        actions={
          <>
            <AssignmentStatusBadge status={a.status} />
            <Button variant="outline" onClick={() => setEnrolling(true)}><UserPlus /> Enroll students</Button>
          </>
        }
        showStudent
        hideAssignment
      />
      {enrolling && <EnrollStudentsDialog assignment={a} onClose={() => setEnrolling(false)} />}
    </>
  );
}
