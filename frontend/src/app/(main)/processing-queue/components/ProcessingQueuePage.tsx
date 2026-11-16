"use client";

/* The API reports only the worker's status and how many jobs failed; the job list and
   worker controls stay visible but disabled until it exposes them. */
import { Layers, RefreshCw } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useWorkerSummary } from "../queries";
import { WorkerStatusBanner } from "./WorkerStatusBanner";

export default function ProcessingQueuePage() {
  const { data } = useWorkerSummary();

  return (
    <PageContainer>
      <PageHeader
        title="Processing queue"
        subtitle="Monitor the background worker and the documents waiting to be analysed."
        actions={<NotAvailable><Button variant="outline" disabled><RefreshCw /> Retry all failed</Button></NotAvailable>}
      />

      <WorkerStatusBanner summary={data} />

      <Empty className="mt-4 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Layers /></EmptyMedia>
          <EmptyTitle>The job list isn&apos;t available yet.</EmptyTitle>
          <EmptyDescription>Each document&apos;s processing status shows on the Documents page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </PageContainer>
  );
}
