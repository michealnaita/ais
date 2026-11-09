import { Ban, Check, EllipsisVertical, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User, UserAction } from "../types";

type UserRowMenuProps = {
  user: User;
  onAction: (action: UserAction) => void;
};

export function UserRowMenu({ user, onAction }: UserRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction("edit")}><PenLine /> Edit user</DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.active
          ? <DropdownMenuItem variant="destructive" onClick={() => onAction("toggle")}><Ban /> Deactivate</DropdownMenuItem>
          : <DropdownMenuItem onClick={() => onAction("toggle")}><Check /> Reactivate</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
