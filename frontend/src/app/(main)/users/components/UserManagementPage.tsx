"use client";

import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FilterRow } from "@/components/FilterRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCreateUser, useToggleUserStatus, useUpdateUser } from "../actions";
import { FILTERS } from "../constants";
import { useUsers } from "../queries";
import type { User, UserAction, UserFilter, UserFormData, UserModal } from "../types";
import { ToggleUserStatusDialog } from "./ToggleUserStatusDialog";
import { UserFormDialog } from "./UserFormDialog";
import { UsersTable } from "./UsersTable";

export default function UserManagementPage() {
  const { data: rows = [], isPending } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toggleMutation = useToggleUserStatus();
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<UserModal | null>(null);

  const counts = useMemo(() => {
    const c: Record<UserFilter, number> = { all: rows.length, student: 0, instructor: 0, admin: 0, deactivated: 0 };
    rows.forEach(r => { c[r.role]++; if (!r.active) c.deactivated++; });
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const fOk = filter === "all" ? true : filter === "deactivated" ? !r.active : r.role === filter;
      const qOk = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
      return fOk && qOk;
    });
  }, [rows, filter, query]);

  function handleAction(u: User, type: UserAction) {
    setModal({ type, u });
  }
  function createUser(data: UserFormData) {
    createMutation.mutate(data, {
      onSuccess: () => { setModal(null); toast.success(`Created “${data.name}”`); },
    });
  }
  function saveEdit(u: User, data: UserFormData) {
    updateMutation.mutate({ id: u.id, data }, {
      onSuccess: () => { setModal(null); toast.success(`Updated “${data.name}”`); },
    });
  }
  function confirmToggle(u: User) {
    toggleMutation.mutate(u, {
      onSuccess: () => { setModal(null); toast.success(u.active ? `Deactivated “${u.name}”` : `Reactivated “${u.name}”`); },
    });
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          title="User management"
          subtitle="Create, edit and manage access for every account on the platform."
          actions={<Button onClick={() => setModal({ type: "create" })}><UserPlus /> Create user</Button>}
        />

        <FilterRow>
          <InputGroup className="w-72">
            <InputGroupInput placeholder="Search by name or email" value={query} onChange={e => setQuery(e.target.value)} />
            <InputGroupAddon><Search /></InputGroupAddon>
          </InputGroup>
          <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as UserFilter); }}>
            {FILTERS.map(f => (
              <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterRow>

        <div className="mt-[18px] mb-3.5 text-[13.5px] text-ink-tertiary">{visible.length} {visible.length === 1 ? "user" : "users"}{filter !== "all" ? " in this view" : ""}</div>

        <UsersTable loading={isPending} users={visible} onAction={handleAction} />
      </PageContainer>

      {modal?.type === "create" && <UserFormDialog mode="create" onClose={() => setModal(null)} onSave={createUser} />}
      {modal?.type === "edit" && <UserFormDialog mode="edit" initial={modal.u} onClose={() => setModal(null)} onSave={d => saveEdit(modal.u, d)} />}
      {modal?.type === "toggle" && <ToggleUserStatusDialog user={modal.u} onClose={() => setModal(null)} onConfirm={() => confirmToggle(modal.u)} />}
    </>
  );
}
