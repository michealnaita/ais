"use client";

import { FileText, TriangleAlert, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { formatSize } from "@/utils/formatSize";
import { useAdminDashboard } from "../../queries";
import { systemServices, userCounts } from "../../utils";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { STAT_CARD } from "../../constants";
import { SystemStatusCard } from "./SystemStatusCard";
import { UserBreakdown } from "./UserBreakdown";

export default function AdminOverviewPage() {
  const { data, isPending } = useAdminDashboard();
  const failedJobs = data?.failedJobCount ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        subtitle="Users, documents and system health across the Academic Integrity System."
      />

      <div className="mb-[30px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm" className={STAT_CARD}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><Users className="size-4" /> Total users</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{data ? data.users.count.toLocaleString() : "—"}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground"><UserBreakdown counts={data ? userCounts(data.users) : []} /></CardFooter>
        </Card>
        <Card size="sm" className={STAT_CARD}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><FileText className="size-4" /> Documents in repository</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{data ? data.documents.count.toLocaleString() : "—"}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{data ? `${formatSize(data.documents.size)} stored` : "\u00a0"}</CardFooter>
        </Card>
        <Card size="sm" className={STAT_CARD}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><TriangleAlert className="size-4" /> Failed processing jobs</CardDescription>
            <CardTitle className={cn("text-2xl font-bold tabular-nums", failedJobs > 0 && "text-red-fg")}>{data ? failedJobs : "—"}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{failedJobs > 0 ? `${failedJobs} job${failedJobs === 1 ? "" : "s"} need attention` : "No failures — all jobs healthy"}</CardFooter>
        </Card>
        <SystemStatusCard systems={data ? systemServices(data.systemHealth) : []} />
      </div>

      <ActivityFeedCard events={data?.recentActivity ?? []} loading={isPending} />
    </PageContainer>
  );
}
