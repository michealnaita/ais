import { Cpu, Play, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { QueueFilter } from "../types";
import { WorkerStat } from "./WorkerStat";

type WorkerStatusBannerProps = {
  running: boolean;
  counts: Record<QueueFilter, number>;
  onToggle: () => void;
};

export function WorkerStatusBanner({ running, counts, onToggle }: WorkerStatusBannerProps) {
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
          <Badge variant={running ? "secondary" : "destructive"}>{running ? "Running" : "Stopped"}</Badge>
        </div>
        <div className="mt-[3px] text-[13.5px] text-ink-tertiary">{running
          ? `Celery · 1 task active · ${counts.pending} waiting in queue`
          : "Stopped — no jobs will be processed until restarted"}</div>
      </div>
      <div className="mr-2 flex gap-[26px]">
        <WorkerStat value={counts.processing} label="PROCESSING" />
        <WorkerStat value={counts.pending} label="PENDING" />
        <WorkerStat value={counts.failed} label="FAILED" fail={counts.failed > 0} />
      </div>
      {running
        ? <Button variant="outline" onClick={onToggle}><Square size={15} fill="currentColor" /> Stop worker</Button>
        : <Button onClick={onToggle}><Play size={16} fill="currentColor" /> Start worker</Button>}
    </div>
  );
}
