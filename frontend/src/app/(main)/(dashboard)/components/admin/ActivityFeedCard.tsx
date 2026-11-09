import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { FeedEvent } from "../../types";
import { ActivityFeedItem } from "./ActivityFeedItem";

export function ActivityFeedCard({ events }: { events: FeedEvent[] }) {
  return (
    <section>
      <SectionHead title="Recent activity">
        <Link className={buttonVariants({ variant: "outline" })} href={ROUTES.systemLogs}>All events <ArrowUpRight /></Link>
      </SectionHead>
      <Card className="mt-3">
        <CardContent className="divide-y divide-border">
          {events.map((e, i) => <ActivityFeedItem key={i} event={e} />)}
        </CardContent>
      </Card>
    </section>
  );
}
