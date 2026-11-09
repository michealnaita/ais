"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRetryFailedJobs, useRetryJob } from "../actions";
import { FILTERS } from "../constants";
import { useJobs } from "../queries";
import { JobsTable } from "./JobsTable";
import { StopWorkerDialog } from "./StopWorkerDialog";
import type { Job, QueueFilter } from "../types";
import { WorkerStatusBanner } from "./WorkerStatusBanner";

export default function ProcessingQueuePage() {
  const { data: rows = [] } = useJobs();
  const retryMutation = useRetryJob();
  const retryAllMutation = useRetryFailedJobs();
  const [running, setRunning] = useState(true);
  const [filter, setFilter] = useState<QueueFilter>("active");
  const [stopOpen, setStopOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { pending: 0, processing: 0, complete: 0, failed: 0 };
    rows.forEach(r => c[r.status]++);
    return { ...c, active: c.pending + c.processing };
  }, [rows]);

  const visible = useMemo(() => {
    if (filter === "active") return rows.filter(r => r.status === "pending" || r.status === "processing");
    return rows.filter(r => r.status === filter);
  }, [rows, filter]);

  function retry(job: Job) {
    retryMutation.mutate(job.id, { onSuccess: () => toast.success(`Re-queued ${job.file}`) });
  }
  function retryAll() {
    retryAllMutation.mutate(undefined, {
      onSuccess: n => toast.success(`Re-queued ${n} failed job${n === 1 ? "" : "s"}`),
    });
  }
  function toggleWorker() {
    if (running) { setStopOpen(true); }
    else { setRunning(true); toast.success("Background worker started"); }
  }
  function confirmStop() { setRunning(false); setStopOpen(false); toast.success("Background worker stopped"); }

  return (
    <>
      <PageContainer>
        <PageHeader
          title="Processing queue"
          subtitle="Monitor the background worker and the documents waiting to be analysed."
          actions={<Button variant="outline" disabled={counts.failed === 0} onClick={retryAll}><RefreshCw /> Retry all failed</Button>}
        />

        <WorkerStatusBanner running={running} counts={counts} onToggle={toggleWorker} />

        <FilterRow>
          <div className="text-[13.5px] text-ink-tertiary">{visible.length} job{visible.length === 1 ? "" : "s"} in view</div>
          <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as QueueFilter); }}>
            {FILTERS.map(f => (
              <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterRow>

        <JobsTable jobs={visible} onRetry={retry} />
      </PageContainer>

      {stopOpen && <StopWorkerDialog onClose={() => setStopOpen(false)} onConfirm={confirmStop} />}
    </>
  );
}
