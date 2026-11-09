"use client";

import { Plus, Search } from "lucide-react";
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
import type { Assignment, AssignmentFormData } from "@/types/assignment";
import { useCloseAssignment, useCreateAssignment, useDeleteAssignment, useUpdateAssignment } from "../actions";
import { FILTERS } from "../constants";
import type { AssignmentAction, AssignmentFilter, AssignmentModal } from "../types";
import { AssignmentFormDialog } from "./AssignmentFormDialog";
import { AssignmentsTable } from "./AssignmentsTable";
import { DeleteAssignmentDialog } from "./DeleteAssignmentDialog";
import { ViewSubmissionsDialog } from "./ViewSubmissionsDialog";

export default function AssignmentsPage() {
  const { data: rows = [], isPending } = useAssignments();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const closeMutation = useCloseAssignment();
  const deleteMutation = useDeleteAssignment();
  const [filter, setFilter] = useState<AssignmentFilter>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<AssignmentModal | null>(null);

  const counts = useMemo(() => {
    const c: Record<AssignmentFilter, number> = { all: rows.length, open: 0, upcoming: 0, closed: 0 };
    rows.forEach(r => c[r.status]++);
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => (filter === "all" || r.status === filter) && (!q || r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q)));
  }, [rows, filter, query]);

  function handleAction(a: Assignment, type: AssignmentAction) {
    if (type === "close") {
      closeMutation.mutate(a.id, { onSuccess: () => toast.success(`“${a.name}” closed — no longer accepting submissions`) });
    } else {
      setModal({ type, a });
    }
  }

  function createAssignment(data: AssignmentFormData) {
    createMutation.mutate(data, {
      onSuccess: () => { setModal(null); toast.success(`Created “${data.name}”`); },
    });
  }
  function saveEdit(a: Assignment, data: AssignmentFormData) {
    updateMutation.mutate({ id: a.id, data }, {
      onSuccess: () => { setModal(null); toast.success(`Updated “${data.name}”`); },
    });
  }
  function confirmDelete(a: Assignment) {
    deleteMutation.mutate(a.id, {
      onSuccess: () => { setModal(null); toast.success(`Deleted “${a.name}”`); },
    });
  }

  return (
    <>
      <PageContainer>
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

        <AssignmentsTable loading={isPending} assignments={visible} onAction={handleAction} />
      </PageContainer>

      {modal?.type === "create" && <AssignmentFormDialog mode="create" onClose={() => setModal(null)} onSave={createAssignment} />}
      {modal?.type === "edit" && <AssignmentFormDialog mode="edit" initial={modal.a} onClose={() => setModal(null)} onSave={d => saveEdit(modal.a, d)} />}
      {modal?.type === "delete" && <DeleteAssignmentDialog assignment={modal.a} onClose={() => setModal(null)} onConfirm={() => confirmDelete(modal.a)} />}
      {modal?.type === "view" && <ViewSubmissionsDialog assignment={modal.a} onClose={() => setModal(null)} />}
    </>
  );
}
