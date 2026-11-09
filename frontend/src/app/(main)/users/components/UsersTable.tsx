import { Users } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, UserAction } from "../types";
import { UserRow } from "./UserRow";

type UsersTableProps = {
  users: User[];
  loading?: boolean;
  onAction: (user: User, action: UserAction) => void;
};

export function UsersTable({ users, loading, onAction }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5}>
              <Empty><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>{loading ? "Loading users…" : "No users match this view."}</EmptyTitle></EmptyHeader></Empty>
            </TableCell>
          </TableRow>
        ) : users.map(u => (
          <UserRow key={u.id} user={u} onAction={t => onAction(u, t)} />
        ))}
      </TableBody>
    </Table>
  );
}
