import { TitleCell } from "@/components/TitleCell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { initials } from "@/utils/initials";
import type { User, UserAction } from "../types";
import { NotAvailable } from "@/components/NotAvailable";
import { fullName } from "../utils";
import { UserRowMenu } from "./UserRowMenu";

type UserRowProps = {
  user: User;
  onAction: (action: UserAction) => void;
};

export function UserRow({ user, onAction }: UserRowProps) {
  const name = fullName(user);
  const active = user.status === "active";
  return (
    <TableRow className={cn(!active && "text-muted-foreground")}>
      <TableCell>
        <TitleCell icon={<Avatar><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>} title={name} caption={`AIS-${user.id.slice(0, 6).toUpperCase()}`} />
      </TableCell>
      <TableCell>{user.email}</TableCell>
      {/* The API doesn't return roles yet. */}
      <TableCell><NotAvailable><span className="text-muted-foreground">—</span></NotAvailable></TableCell>
      <TableCell><Badge variant={active ? "secondary" : "outline"}>{active ? "Active" : "Deactivated"}</Badge></TableCell>
      <TableCell><UserRowMenu user={user} onAction={onAction} /></TableCell>
    </TableRow>
  );
}
