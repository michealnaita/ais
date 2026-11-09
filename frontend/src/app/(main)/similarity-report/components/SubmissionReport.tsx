"use client";

/* Looks up a submission by id and shows its similarity report. Students can
   only open their own completed submissions. */
import { FileText } from "lucide-react";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import SimilarityReportPage from "./SimilarityReportPage";
import { useUser } from "@/context/UserProvider";
import { useReportContent, useSubmission } from "../queries";

export function SubmissionReport({ id }: { id: string }) {
  const user = useUser();
  const { data: sub, isPending } = useSubmission(Number(id));
  const visible = !!sub && sub.status === "complete" && sub.score != null
    && (user.role !== "student" || sub.studentId === user.id);
  const content = useReportContent(Number(id), visible);

  if (isPending || (visible && content.isPending)) return <div className="flex-1" />;

  if (!visible || !content.data) {
    return (
      <PageContainer>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileText /></EmptyMedia>
            <EmptyTitle>This report isn&apos;t available.</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Link className={buttonVariants({ variant: "link" })} href={ROUTES.submissions}>Back to submissions</Link>
          </EmptyContent>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <SimilarityReportPage
      key={sub.id}
      content={content.data}
      report={{ doc: sub.name, student: sub.student, assignment: sub.assignment, date: sub.date, score: sub.score! }}
    />
  );
}
