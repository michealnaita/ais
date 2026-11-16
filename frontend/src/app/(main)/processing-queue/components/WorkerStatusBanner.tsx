import { Cpu, Square } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { WorkerSummary } from "../types";
import { WorkerStat } from "./WorkerStat";

export function WorkerStatusBanner({ summary }: { summary?: WorkerSummary }) {
  const running = summary?.workerStatus !== "stopped";
  const failed = summary?.failedJobCount ?? 0;
  return (
    <div className={cn(
      "mb-6 flex items-center gap-4 rounded-2xl border px-[22px] py-[18px]",
      running ? "border-line bg-white" : "border-[#f3c9c3] bg-[#fffaf9]",
    )}>
      <span className={cn("flex size-[46px] shrink-0 items-center justify-center rounded-xl", running ? "bg-green-bg text-green-fg" : "bg-red-bg text-red-fg")}>
        <Cpu size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 text-base font-semibold">
          Background worker
          {summary && <Badge variant={running ? "secondary" : "destructive"}>{running ? "Running" : "Stopped"}</Badge>}
        </div>
        <div className="mt-[3px] text-[13.5px] text-ink-tertiary">{running
          ? "Celery · documents are processed as they're uploaded"
          : "Stopped — no documents will be processed until it's restarted"}</div>
      </div>
      <div className="mr-2 flex gap-[26px]">
        <WorkerStat value={failed} label="FAILED" fail={failed > 0} />
      </div>
      <NotAvailable>
        <Button variant="outline" disabled><Square size={15} fill="currentColor" /> {running ? "Stop worker" : "Start worker"}</Button>
      </NotAvailable>
    </div>
  );
}
