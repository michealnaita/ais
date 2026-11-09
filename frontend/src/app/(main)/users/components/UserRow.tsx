import { TitleCell } from "@/components/TitleCell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { initials } from "@/utils/initials";
import type { User, UserAction } from "../types";
import { RoleLabel } from "./RoleLabel";
import { UserRowMenu } from "./UserRowMenu";

type UserRowProps = {
  user: User;
  onAction: (action: UserAction) => void;
};

export function UserRow({ user, onAction }: UserRowProps) {
  return (
    <TableRow className={cn(!user.active && "text-muted-foreground")}>
      <TableCell>
        <TitleCell icon={<Avatar><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>} title={user.name} caption={`AIS-${user.id}`} />
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell><RoleLabel role={user.role} /></TableCell>
      <TableCell><Badge variant={user.active ? "secondary" : "outline"}>{user.active ? "Active" : "Deactivated"}</Badge></TableCell>
      <TableCell><UserRowMenu user={user} onAction={onAction} /></TableCell>
    </TableRow>
  );
}
