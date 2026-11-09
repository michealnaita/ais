import { EllipsisVertical, Eye, Lock, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Assignment } from "@/types/assignment";
import type { AssignmentAction } from "../types";

type AssignmentRowMenuProps = {
  assignment: Assignment;
  onAction: (action: AssignmentAction) => void;
};

export function AssignmentRowMenu({ assignment, onAction }: AssignmentRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction("view")}><Eye /> View submissions</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit")}><PenLine /> Edit details</DropdownMenuItem>
        {assignment.status === "open" && (
          <DropdownMenuItem onClick={() => onAction("close")}><Lock /> Close assignment</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete")}><Trash2 /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
