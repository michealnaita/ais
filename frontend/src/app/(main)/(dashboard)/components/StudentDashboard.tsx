'use client';

/* Student home: totals and submission history, with upcoming assignments alongside when there are any. */
import { ArrowUpRight, ClipboardList, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ContentSplit } from '@/components/ContentSplit';
import { CornerIllustration } from '@/components/Illustration';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/PageHeader';
import { PendingAssignmentsCard } from '@/components/student-assignments/PendingAssignmentsCard';
import { StudentAssignmentDialogs } from '@/components/student-assignments/StudentAssignmentDialogs';
import { SectionHead } from '@/components/SectionHead';
import { SubmissionHistory } from '@/components/submissions/SubmissionHistory';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/UserProvider';
import { ROUTES } from '@/lib/routes';
import type { Assignment } from '@/types/assignment';
import { useStudentDashboard } from '../queries';

export function StudentDashboard() {
  const user = useUser();
  const { data, isPending } = useStudentDashboard();
  const [detail, setDetail] = useState<Assignment | null>(null);

  const rows = data?.submissionHistory ?? [];
  const upcoming = data?.upcomingAssignments ?? [];
  const stats = {
    total: data?.submissionCount ?? 0,
    /* Only counts the recent history the dashboard returns. */
    inReview: rows.filter((r) => r.documentStatus === 'queued').length,
    enrolled: data?.assignmentCount ?? 0,
  };

  return (
    <>
      <PageContainer>
        <PageHeader
          title={`Welcome back, ${user.firstName}`}
          subtitle="Your submission history and the assignments waiting on you."
        />

        <ContentSplit
          main={
            <>
              <div className="mb-[34px] grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card size="sm" className="relative bg-brand-accent text-brand-accent-foreground ring-0 [&_[data-slot=card-description]]:text-brand-accent-foreground/75">
                  <CornerIllustration name="target" className="invert" />
                  <CardHeader className="relative">
                    <CardDescription className="flex items-center gap-2"><Inbox className="size-4" /> Total submissions</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{stats.total}</CardTitle>
                  </CardHeader>
                  <CardFooter className="relative text-sm text-brand-accent-foreground/75">{stats.inReview} still being analysed</CardFooter>
                </Card>
                <Card size="sm" className="relative bg-primary text-primary-foreground ring-0 [&_[data-slot=card-description]]:text-primary-foreground/70">
                  <CornerIllustration name="growing" className="h-[84px]" />
                  <CardHeader className="relative">
                    <CardDescription className="flex items-center gap-2"><ClipboardList className="size-4" /> Enrolled assignments</CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums">{stats.enrolled}</CardTitle>
                  </CardHeader>
                  <CardFooter className="relative text-sm text-primary-foreground/70">{upcoming.length} not yet submitted</CardFooter>
                </Card>
              </div>

              <SectionHead title="Submission history">
                <Link className={buttonVariants({ variant: 'outline' })} href={ROUTES.submissions}>
                  View all <ArrowUpRight />
                </Link>
              </SectionHead>
              <Card className="mt-3">
                <CardContent>
                  <SubmissionHistory
                    className="mt-0"
                    inlineAssignment
                    submissions={rows}
                    emptyMessage="You haven't submitted anything yet."
                    loading={isPending}
                  />
                </CardContent>
              </Card>
            </>
          }
          aside={
            upcoming.length > 0 && (
              <PendingAssignmentsCard
                title="Upcoming assignments"
                subtitle="waiting to be submitted"
                assignments={upcoming}
                illustration="time-flies"
                onSelect={setDetail}
              />
            )
          }
        />
      </PageContainer>

      <StudentAssignmentDialogs assignment={detail} onClose={() => setDetail(null)} />
    </>
  );
}
