"use client";

import { FileText, TriangleAlert, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { useAdminOverview } from "../../queries";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { SystemStatusCard } from "./SystemStatusCard";
import { UserBreakdown } from "./UserBreakdown";

export default function AdminOverviewPage() {
  const { data } = useAdminOverview();
  const failedJobs = data?.failedJobs ?? 0;

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        subtitle="Users, documents and system health across the Academic Integrity System."
      />

      <div className="mb-[30px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><Users className="size-4" /> Total users</CardDescription>
            <CardTitle className="text-2xl tabular-nums">1,284</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground"><UserBreakdown counts={data?.userCounts ?? []} /></CardFooter>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><FileText className="size-4" /> Documents in repository</CardDescription>
            <CardTitle className="text-2xl tabular-nums">9,712</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">Across 1.84 GB of indexed vectors</CardFooter>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2"><TriangleAlert className="size-4" /> Failed processing jobs</CardDescription>
            <CardTitle className={cn("text-2xl tabular-nums", failedJobs > 0 && "text-destructive")}>{data ? failedJobs : "—"}</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">{failedJobs > 0 ? `${failedJobs} job${failedJobs === 1 ? "" : "s"} need attention` : "No failures — all jobs healthy"}</CardFooter>
        </Card>
        <SystemStatusCard systems={data?.systems ?? []} />
      </div>

      <ActivityFeedCard events={data?.feed ?? []} />
    </PageContainer>
  );
}
