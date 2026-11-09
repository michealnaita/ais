import { Activity } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { SystemService } from "../../types";

/** Minimal system status: overall state plus a dot per service. */
export function SystemStatusCard({ systems }: { systems: SystemService[] }) {
  const down = systems.filter(s => !s.up).length;
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2"><Activity className="size-4" /> System status</CardDescription>
        <CardTitle className={cn("text-2xl", down > 0 && "text-destructive")}>
          {systems.length === 0 ? "—" : down === 0 ? "Operational" : "Degraded"}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-wrap gap-x-3.5 gap-y-1 text-sm text-muted-foreground">
        {systems.map(s => (
          <span key={s.name} className="flex items-center gap-1.5" title={s.up ? "Reachable" : "Unreachable"}>
            <span className={cn("size-[7px] rounded-full", s.up ? "bg-green-dot" : "bg-destructive")} />
            {s.name}
          </span>
        ))}
      </CardFooter>
    </Card>
  );
}
