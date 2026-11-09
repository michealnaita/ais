"use client";

import { RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { FILTERS } from "../constants";
import { useLogs } from "../queries";
import { LogViewer } from "./LogViewer";
import type { LogFilter } from "../types";

export default function SystemLogsPage() {
  const [filter, setFilter] = useState<LogFilter>("all");
  const [query, setQuery] = useState("");
  const { data: logs = [], isPending, isFetching, refetch } = useLogs();

  const counts = useMemo(() => {
    const c: Record<LogFilter, number> = { all: logs.length, info: 0, warning: 0, error: 0 };
    logs.forEach(l => c[l.sev]++);
    return c;
  }, [logs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter(l => (filter === "all" || l.sev === filter) && (!q || l.msg.toLowerCase().includes(q) || l.src.toLowerCase().includes(q)));
  }, [logs, filter, query]);

  return (
    <>
      <PageContainer>
        <PageHeader
          title="System logs"
          subtitle="Recent system events, processing activity and errors."
          actions={<Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw /> Refresh</Button>}
        />

        <FilterRow>
          <InputGroup className="w-72">
            <InputGroupInput placeholder="Search messages or source" value={query} onChange={e => setQuery(e.target.value)} />
            <InputGroupAddon><Search /></InputGroupAddon>
          </InputGroup>
          <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as LogFilter); }}>
            {FILTERS.map(f => (
              <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterRow>

        <LogViewer entries={visible} total={logs.length} loading={isPending} />
      </PageContainer>
    </>
  );
}
