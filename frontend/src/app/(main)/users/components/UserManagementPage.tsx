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
import { NotAvailable } from "@/components/NotAvailable";
import { isApiError } from "@/lib/api";
import { useCreateUser, useDeactivateUser } from "../actions";
import { FILTERS } from "../constants";
import { useUsers } from "../queries";
import type { User, UserAction, UserFilter, UserFormData, UserModal } from "../types";
import { fullName } from "../utils";
import { ToggleUserStatusDialog } from "./ToggleUserStatusDialog";
import { UserFormDialog } from "./UserFormDialog";
import { UsersTable } from "./UsersTable";

export default function UserManagementPage() {
  const { data: rows = [], isPending } = useUsers();
  const createMutation = useCreateUser();
  const deactivateMutation = useDeactivateUser();
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<UserModal | null>(null);

  const counts = useMemo(() => {
    const c: Partial<Record<UserFilter, number>> = { all: rows.length, deactivated: 0 };
    rows.forEach(r => { if (r.status !== "active") c.deactivated!++; });
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      const fOk = filter === "all" || (filter === "deactivated" && r.status !== "active");
      const qOk = !q || fullName(r).toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
      return fOk && qOk;
    });
  }, [rows, filter, query]);

  function handleAction(u: User, type: UserAction) {
    setModal({ type, u });
  }
  function createUser(data: UserFormData) {
    createMutation.mutate(data, {
      onSuccess: () => { setModal(null); toast.success(`Created “${fullName(data)}”`); },
      onError: err => toast.error(isApiError(err) ? `Couldn't create the user: ${err.message}` : "Couldn't create the user."),
    });
  }
  function confirmDeactivate(u: User) {
    deactivateMutation.mutate(u.id, {
      onSuccess: () => { setModal(null); toast.success(`Deactivated “${fullName(u)}”`); },
      onError: err => toast.error(isApiError(err) ? `Couldn't deactivate: ${err.message}` : "Couldn't deactivate the user."),
    });
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          title="User management"
          subtitle="Create accounts and manage access across the platform."
          actions={<Button onClick={() => setModal({ type: "create" })}><UserPlus /> Create user</Button>}
        />

        <FilterRow>
          <InputGroup className="w-72">
            <InputGroupInput placeholder="Search by name or email" value={query} onChange={e => setQuery(e.target.value)} />
            <InputGroupAddon><Search /></InputGroupAddon>
          </InputGroup>
          <ToggleGroup value={[filter]} onValueChange={v => { if (v[0]) setFilter(v[0] as UserFilter); }}>
            {FILTERS.map(f => counts[f.key] == null ? (
              /* Role filters need roles, which the API doesn't return yet. */
              <NotAvailable key={f.key}><ToggleGroupItem value={f.key} disabled>{f.label}</ToggleGroupItem></NotAvailable>
            ) : (
              <ToggleGroupItem key={f.key} value={f.key}>{f.label} <Badge variant="secondary">{counts[f.key]}</Badge></ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterRow>

        <div className="mt-[18px] mb-3.5 text-[13.5px] text-ink-tertiary">{visible.length} {visible.length === 1 ? "user" : "users"}{filter !== "all" ? " in this view" : ""}</div>

        <UsersTable loading={isPending} users={visible} onAction={handleAction} />
      </PageContainer>

      {modal?.type === "create" && <UserFormDialog pending={createMutation.isPending} onClose={() => setModal(null)} onSave={createUser} />}
      {modal?.type === "deactivate" && <ToggleUserStatusDialog user={modal.u} onClose={() => setModal(null)} onConfirm={() => confirmDeactivate(modal.u)} />}
    </>
  );
}
