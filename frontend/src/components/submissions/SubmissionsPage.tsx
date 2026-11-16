"use client";

/* Searchable, filterable submissions screen. Used by /submissions (per role) and
   /assignments/:id/submissions; callers supply the rows and the header. */
import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { Submission, SubmissionFilter } from "@/types/submission";
import { FILTERS } from "./filters";
import { SubmissionHistory } from "./SubmissionHistory";

type SubmissionsPageProps = {
  submissions: Submission[];
  loading?: boolean;
  title: string;
  subtitle: string;
  /** Link back to a parent screen, shown above the title. */
  back?: { href: string; label: string };
  actions?: ReactNode;
  /** Instructor view: adds a Student column and searches by student name. */
  showStudent?: boolean;
  /** Drop the Assignment column when every row belongs to the same assignment. */
  hideAssignment?: boolean;
};

export function SubmissionsPage({ submissions, loading, title, subtitle, back, actions, showStudent, hideAssignment }: SubmissionsPageProps) {
  const [filter, setFilter] = useState<SubmissionFilter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: submissions.length, queued: 0, processed: 0, failed: 0 };
    submissions.forEach(r => c[r.documentStatus]++);
    return c;
  }, [submissions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter(r => {
      const matchF = filter === "all" || r.documentStatus === filter;
      const matchQ = !q || [r.fileName, r.assignmentTitle, showStudent ? r.submittedBy : ""].some(v => v.toLowerCase().includes(q));
      return matchF && matchQ;
    });
  }, [submissions, filter, query, showStudent]);

  const layout = !showStudent ? "student" : hideAssignment ? "compact" : "instructor";

  return (
    <PageContainer fill>
      <PageHeader title={title} subtitle={subtitle} back={back} actions={actions} />
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
        layout={layout}
        loading={loading}
        scrollBody
        total={submissions.length}
      />
    </PageContainer>
  );
}
