"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAssignments } from "@/hooks/useAssignments";
import { assignmentSubmissionsRoute } from "@/lib/routes";
import type { Assignment, AssignmentFormData } from "@/types/assignment";
import { isApiError } from "@/lib/api";
import { useCreateAssignment } from "../actions";
import { FILTERS } from "../constants";
import type { AssignmentAction, AssignmentFilter, AssignmentModal } from "../types";
import { AssignmentFormDialog } from "./AssignmentFormDialog";
import { AssignmentsTable } from "./AssignmentsTable";
import { EnrollStudentsDialog } from "./EnrollStudentsDialog";

export default function AssignmentsPage() {
  const router = useRouter();
  const { data: rows = [], isPending } = useAssignments();
  const createMutation = useCreateAssignment();
  const [filter, setFilter] = useState<AssignmentFilter>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<AssignmentModal | null>(null);

  const counts = useMemo(() => {
    const c: Record<AssignmentFilter, number> = { all: rows.length, open: 0, closed: 0 };
    rows.forEach(r => c[r.status]++);
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => (filter === "all" || r.status === filter) && (!q || r.title.toLowerCase().includes(q) || r.enrollmentCode.toLowerCase().includes(q)));
  }, [rows, filter, query]);

  function handleAction(a: Assignment, type: AssignmentAction) {
    if (type === "view") router.push(assignmentSubmissionsRoute(a.id));
    else setModal({ type, a });
  }

  function createAssignment(data: AssignmentFormData) {
    createMutation.mutate(data, {
      /* Straight on to enrolling students in the new assignment. */
      onSuccess: created => { setModal({ type: "enroll", a: created }); toast.success(`Created “${data.title}”`); },
      onError: err => toast.error(isApiError(err) ? `Couldn't create the assignment: ${err.message}` : "Couldn't create the assignment."),
    });
  }

  return (
    <>
      <PageContainer fill>
        <PageHeader
          title="Assignments"
          subtitle="Create assignments and track submissions across your courses."
          actions={<Button onClick={() => setModal({ type: "create" })}><Plus /> Create assignment</Button>}
        />

        <FilterRow>
          <InputGroup className="w-72">
            <InputGroupInput placeholder="Search assignments" value={query} onChange={e => setQuery(e.target.value)} />
            <InputGroupAddon><Search /></InputGroupAddon>
          </InputGroup>
          <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as AssignmentFilter); }}>
            {FILTERS.map(f => (
              <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterRow>

        <AssignmentsTable loading={isPending} assignments={visible} total={rows.length} onAction={handleAction} />
      </PageContainer>

      {modal?.type === "create" && <AssignmentFormDialog pending={createMutation.isPending} onClose={() => setModal(null)} onSave={createAssignment} />}
      {modal?.type === "enroll" && <EnrollStudentsDialog assignment={modal.a} onClose={() => setModal(null)} />}
    </>
  );
}
