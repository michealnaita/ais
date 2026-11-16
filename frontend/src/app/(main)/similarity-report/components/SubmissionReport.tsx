"use client";

/* Loads a submission and shows its similarity report. The backend decides who may see
   it (the student who submitted, the assignment's instructor, or an admin). */
import { FileText, Loader, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ROUTES } from "@/lib/routes";
import { useReportDocument, useSubmission } from "../queries";
import { toReportContent } from "../utils";
import SimilarityReportPage from "./SimilarityReportPage";

export function SubmissionReport({ id }: { id: string }) {
  const { data: sub, isPending, isError } = useSubmission(id);
  const scored = !!sub?.similarityReport;
  const preview = useReportDocument(id, scored);

  if (isPending || (scored && preview.isPending)) return <div className="flex-1" />;

  if (isError || !sub) return <Unavailable icon={<FileText />} title="This report isn't available." />;
  if (sub.documentStatus === "failed") {
    return <Unavailable icon={<TriangleAlert />} title="This document couldn't be analysed." description="Processing failed, so there's no similarity report. Try submitting it again." />;
  }
  if (!sub.similarityReport) {
    return <Unavailable icon={<Loader />} title="Still analysing this document." description="The report appears here as soon as processing finishes." />;
  }
  if (preview.data?.status === "processing") {
    return <Unavailable icon={<Loader />} title="Preparing the document preview…" />;
  }
  if (!preview.data?.htmlContent) {
    return <Unavailable icon={<FileText />} title="The document preview isn't available." />;
  }

  return (
    <SimilarityReportPage
      key={sub.id}
      submission={sub}
      content={toReportContent(sub.similarityReport)}
      html={preview.data.htmlContent}
    />
  );
}

function Unavailable({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <PageContainer>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent>
          <Link className={buttonVariants({ variant: "link" })} href={ROUTES.submissions}>Back to submissions</Link>
        </EmptyContent>
      </Empty>
    </PageContainer>
  );
}
