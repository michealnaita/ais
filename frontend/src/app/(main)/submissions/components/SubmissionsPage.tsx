"use client";

/* Searchable, filterable submissions list; role modules supply the rows. */
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SubmissionHistory } from "@/components/submissions/SubmissionHistory";
import type { Submission, SubmissionFilter } from "@/types/submission";
import { FILTERS } from "../constants";

type SubmissionsPageProps = {
  submissions: Submission[];
  loading?: boolean;
  title: string;
  subtitle: string;
  /** Instructor view: adds a Student column and searches by student name. */
  showStudent?: boolean;
};

export function SubmissionsPage({ submissions, loading, title, subtitle, showStudent }: SubmissionsPageProps) {
  const [filter, setFilter] = useState<SubmissionFilter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: submissions.length, processing: 0, complete: 0, failed: 0, pending: 0 };
    submissions.forEach(r => c[r.status]++);
    return c;
  }, [submissions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter(r => {
      const matchF = filter === "all" || r.status === filter;
      const matchQ = !q || [r.name, r.assignment, showStudent ? r.student : ""].some(v => v.toLowerCase().includes(q));
      return matchF && matchQ;
    });
  }, [submissions, filter, query, showStudent]);

  return (
    <PageContainer>
      <PageHeader title={title} subtitle={subtitle} />
      <FilterRow>
        <InputGroup className="w-72">
          <InputGroupInput placeholder={showStudent ? "Search students or documents" : "Search submissions"} value={query} onChange={e => setQuery(e.target.value)} />
          <InputGroupAddon><Search /></InputGroupAddon>
        </InputGroup>
        <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as SubmissionFilter); }}>
          {FILTERS.map(f => (
            <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterRow>
      <SubmissionHistory
        submissions={visible}
        layout={showStudent ? "instructor" : "student"}
        loading={loading}
      />
    </PageContainer>
  );
}
