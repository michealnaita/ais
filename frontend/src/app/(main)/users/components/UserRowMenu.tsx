import { Ban, Check, EllipsisVertical, PenLine } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User, UserAction } from "../types";

type UserRowMenuProps = {
  user: User;
  onAction: (action: UserAction) => void;
};

/* Editing and reactivating stay visible but disabled until the API supports them. */
export function UserRowMenu({ user, onAction }: UserRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <NotAvailable className="flex"><DropdownMenuItem disabled><PenLine /> Edit user</DropdownMenuItem></NotAvailable>
        <DropdownMenuSeparator />
        {user.status === "active"
          ? <DropdownMenuItem variant="destructive" onClick={() => onAction("deactivate")}><Ban /> Deactivate</DropdownMenuItem>
          : <NotAvailable className="flex"><DropdownMenuItem disabled><Check /> Reactivate</DropdownMenuItem></NotAvailable>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
