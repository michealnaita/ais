import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { SystemLog } from "@/types/api";
import { ActivityFeedItem } from "./ActivityFeedItem";

export function ActivityFeedCard({ events, loading }: { events: SystemLog[]; loading?: boolean }) {
  return (
    <section>
      <SectionHead title="Recent activity">
        <Link className={buttonVariants({ variant: "outline" })} href={ROUTES.systemLogs}>All events <ArrowUpRight /></Link>
      </SectionHead>
      <Card size="sm" className="mt-3 py-1.5">
        <CardContent className="divide-y divide-border px-3">
          {events.length === 0
            ? <div className="py-5 text-center text-sm text-muted-foreground">{loading ? "Loading activity…" : "No activity yet."}</div>
            : events.map(e => <ActivityFeedItem key={e.id} event={e} />)}
        </CardContent>
      </Card>
    </section>
  );
}
