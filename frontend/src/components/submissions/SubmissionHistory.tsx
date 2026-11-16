"use client";

/* Submission history: the plain list of submissions with no search or filters.
   Used as the dashboard overview and as the table on the submissions screen. */
import { useRouter } from "next/navigation";
import { reportRoute } from "@/lib/routes";
import type { Submission } from "@/types/submission";
import { SubmissionsTable, type SubmissionsTableLayout } from "./SubmissionsTable";

type SubmissionHistoryProps = {
  submissions: Submission[];
  layout?: SubmissionsTableLayout;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  inlineAssignment?: boolean;
  scrollBody?: boolean;
  total?: number;
};

export function SubmissionHistory({ submissions, layout = "student", loading, emptyMessage, className, inlineAssignment, scrollBody, total }: SubmissionHistoryProps) {
  const router = useRouter();
  return (
    <SubmissionsTable
      className={className}
      submissions={submissions}
      layout={layout}
      loading={loading}
      emptyMessage={emptyMessage}
      inlineAssignment={inlineAssignment}
      scrollBody={scrollBody}
      total={total}
      onOpen={r => router.push(reportRoute(r.id))}
    />
  );
}
