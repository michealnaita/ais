'use client';

/* Student home: totals and submission history, with upcoming assignments alongside when there are any. */
import { ArrowUpRight, ClipboardList, Inbox, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { ContentSplit } from '@/components/ContentSplit';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/PageHeader';
import { PendingAssignmentsCard } from '@/components/student-assignments/PendingAssignmentsCard';
import { StudentAssignmentDialogs } from '@/components/student-assignments/StudentAssignmentDialogs';
import { SectionHead } from '@/components/SectionHead';
import { SubmissionHistory } from '@/components/submissions/SubmissionHistory';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/UserProvider';
import { useEnrolledAssignments } from '@/hooks/useEnrolledAssignments';
import { useStudentSubmissions, useSubmitDocument } from '@/hooks/useSubmissions';
import { ROUTES } from '@/lib/routes';

export function StudentDashboard() {
  const user = useUser();
  const { data: rows = [], isPending } = useStudentSubmissions(user.id);
  const submitDocument = useSubmitDocument();
  const enrolled = useEnrolledAssignments();

  const upcoming = enrolled.assignments;
  const stats = useMemo(
    () => ({
      total: rows.length,
      inReview: rows.filter((r) => r.status === 'processing').length,
      /* Enrolled = assignments already submitted to plus those still waiting. */
      enrolled: new Set([...rows.map((r) => r.assignment), ...upcoming.map((a) => a.name)]).size,
    }),
    [rows, upcoming],
  );
  const addButton = (
    <Button variant="outline" className={upcoming.length ? 'w-full' : undefined} onClick={() => enrolled.setAddOpen(true)}>
      <Plus /> Add assignment
    </Button>
  );

  return (
    <>
      <PageContainer>
        <PageHeader
          title={`Welcome back, ${user.name.split(' ')[0]}`}
          subtitle="Your submission history and the assignments waiting on you."
          actions={upcoming.length ? undefined : addButton}
        />

        <ContentSplit
          main={
            <>
              <div className="mb-[34px] grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card size="sm">
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2"><Inbox className="size-4" /> Total submissions</CardDescription>
                    <CardTitle className="text-2xl tabular-nums">{stats.total}</CardTitle>
                  </CardHeader>
                  <CardFooter className="text-sm text-muted-foreground">{stats.inReview} still being analysed</CardFooter>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2"><ClipboardList className="size-4" /> Enrolled assignments</CardDescription>
                    <CardTitle className="text-2xl tabular-nums">{stats.enrolled}</CardTitle>
                  </CardHeader>
                  <CardFooter className="text-sm text-muted-foreground">{upcoming.length} not yet submitted</CardFooter>
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
                subtitle="Due soon and not yet submitted"
                assignments={upcoming}
                onSelect={enrolled.setDetail}
                footer={addButton}
              />
            )
          }
        />
      </PageContainer>

      <StudentAssignmentDialogs
        state={enrolled}
        onEnrolled={(a) => toast.success(`Enrolled in ${a.name}`)}
        onSubmit={(doc) => {
          submitDocument.mutate({
            name: doc.name,
            ext: doc.ext,
            size: doc.size,
            assignment: doc.assignment,
            studentId: user.id,
            student: user.name,
          });
          toast.success(`“${doc.name}” submitted to ${doc.assignment}`);
        }}
      />
    </>
  );
}
