"use client";

/* Instructor home: assignment and submission totals, plus the latest submissions. */
import { ArrowUpRight, ClipboardList, Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SubmissionHistory } from "@/components/submissions/SubmissionHistory";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserProvider";
import { useAssignments } from "@/hooks/useAssignments";
import { useInstructorSubmissions } from "@/hooks/useSubmissions";
import { ROUTES } from "@/lib/routes";

const RECENT = 8;

export function InstructorDashboard() {
  const user = useUser();
  const { data: assignments = [] } = useAssignments();
  const { data: submissions = [], isPending: submissionsPending } = useInstructorSubmissions();

  const open = assignments.filter(a => a.status === "open").length;
  const processing = submissions.filter(s => s.status === "processing").length;
  /* Newest first; `date` is a display string such as "May 28, 2026". */
  const recent = useMemo(
    () => [...submissions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, RECENT),
    [submissions],
  );

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user.name.replace(/^Dr\.\s*/, "").split(" ")[0]}`}
        subtitle="Your assignments and the latest work handed in."
        actions={<Link className={buttonVariants()} href={ROUTES.assignments}><ClipboardList /> Manage assignments</Link>}
      />

      <div className="mb-[34px] grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><ClipboardList className="size-4" /> Total assignments</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{assignments.length}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{open} open</CardFooter>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><Inbox className="size-4" /> Total submissions received</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{submissions.length}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{processing} still being analysed</CardFooter>
        </Card>
      </div>

      <SectionHead title="Recent submissions">
        <Link className={buttonVariants({ variant: "outline" })} href={ROUTES.submissions}>All submissions <ArrowUpRight /></Link>
      </SectionHead>
      <Card className="mt-3">
        <CardContent>
          <SubmissionHistory
            className="mt-0"
            layout="instructor"
            submissions={recent}
            emptyMessage="No submissions received yet."
            loading={submissionsPending}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
