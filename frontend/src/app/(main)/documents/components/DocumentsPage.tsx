"use client";

/* Admin view of every document in the repository, irrespective of assignment. */
import { Search, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FILTERS } from "../constants";
import { useDocuments } from "../queries";
import type { DocumentFilter } from "../types";
import { DocumentsTable } from "./DocumentsTable";
import { UploadDocumentsDialog } from "./UploadDocumentsDialog";

export default function DocumentsPage() {
  const { data: rows = [], isPending } = useDocuments();
  const [filter, setFilter] = useState<DocumentFilter>("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  const counts = useMemo(() => {
    const c: Record<DocumentFilter, number> = { all: rows.length, queued: 0, processed: 0, failed: 0 };
    rows.forEach(r => c[r.status]++);
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r =>
      (filter === "all" || r.status === filter) &&
      (!q || r.originalFileName.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q)));
  }, [rows, filter, query]);

  return (
    <PageContainer fill>
      <PageHeader
        title="Documents"
        subtitle="Every document in the repository, across all users and assignments."
        actions={<Button onClick={() => setUploading(true)}><Upload /> Upload documents</Button>}
      />
      <FilterRow>
        <InputGroup className="w-72">
          <InputGroupInput placeholder="Search documents or owners" value={query} onChange={e => setQuery(e.target.value)} />
          <InputGroupAddon><Search /></InputGroupAddon>
        </InputGroup>
        <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as DocumentFilter); }}>
          {FILTERS.map(f => (
            <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterRow>
      <DocumentsTable documents={visible} total={rows.length} loading={isPending} />
      {uploading && <UploadDocumentsDialog onClose={() => setUploading(false)} />}
    </PageContainer>
  );
}
