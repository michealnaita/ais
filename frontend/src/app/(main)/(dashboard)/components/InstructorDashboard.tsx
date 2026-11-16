"use client";

/* Instructor home: assignment and submission totals, plus the latest submissions. */
import { ArrowUpRight, ClipboardList, Inbox, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { CornerIllustration } from "@/components/Illustration";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/SectionHead";
import { SubmissionHistory } from "@/components/submissions/SubmissionHistory";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/utils/cn";
import { useInstructorDashboard } from "../queries";

export function InstructorDashboard() {
  const user = useUser();
  const { data, isPending } = useInstructorDashboard();
  const recent = data?.recentSubmissions ?? [];
  const flagged = data?.flaggedSubmissionCount ?? 0;
  /* Only counts the recent submissions the dashboard returns. */
  const processing = recent.filter(s => s.documentStatus === "queued").length;

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user.firstName}`}
        subtitle="Your assignments and the latest work handed in."
        actions={<Link className={buttonVariants()} href={ROUTES.assignments}><ClipboardList /> Manage assignments</Link>}
      />

      <div className="mb-[34px] grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card size="sm" className="relative bg-primary text-primary-foreground ring-0 [&_[data-slot=card-description]]:text-primary-foreground/70">
          <CornerIllustration name="project-development" className="h-[84px]" />
          <CardHeader className="relative">
            <CardDescription className="flex items-center gap-2"><ClipboardList className="size-4" /> Total assignments</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{data?.assignmentCount ?? 0}</CardTitle>
          </CardHeader>
          <CardFooter className="relative text-sm text-primary-foreground/70">Created by you</CardFooter>
        </Card>
        <Card size="sm" className="relative bg-brand-accent text-brand-accent-foreground ring-0 [&_[data-slot=card-description]]:text-brand-accent-foreground/75">
          <CornerIllustration name="design-proposal" className="invert" />
          <CardHeader className="relative">
            <CardDescription className="flex items-center gap-2"><Inbox className="size-4" /> Total submissions received</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{data?.submissionCount ?? 0}</CardTitle>
          </CardHeader>
          <CardFooter className="relative text-sm text-brand-accent-foreground/75">{processing > 0 ? `${processing} recent still being analysed` : "Across all your assignments"}</CardFooter>
        </Card>
        <Card size="sm" className="relative">
          <CornerIllustration name="lighthouse" className="h-[60px]" />
          <CardHeader className="relative">
            <CardDescription className="flex items-center gap-2"><ShieldAlert className="size-4" /> Flagged for review</CardDescription>
            <CardTitle className={cn("text-2xl font-bold tabular-nums", flagged > 0 && "text-red-fg")}>{flagged}</CardTitle>
          </CardHeader>
          <CardFooter className="relative text-sm text-muted-foreground">30%+ similarity</CardFooter>
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
            loading={isPending}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
