import { EllipsisVertical, Eye, Lock, PenLine, Trash2, UserPlus } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Assignment } from "@/types/assignment";
import type { AssignmentAction } from "../types";

type AssignmentRowMenuProps = {
  assignment: Assignment;
  onAction: (action: AssignmentAction) => void;
};

/* Edit, close and delete stay visible but disabled until the API supports them. */
export function AssignmentRowMenu({ assignment, onAction }: AssignmentRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction("view")}><Eye /> View submissions</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("enroll")}><UserPlus /> Enroll students</DropdownMenuItem>
        <NotAvailable className="flex"><DropdownMenuItem disabled><PenLine /> Edit details</DropdownMenuItem></NotAvailable>
        {assignment.status === "open" && (
          <NotAvailable className="flex"><DropdownMenuItem disabled><Lock /> Close assignment</DropdownMenuItem></NotAvailable>
        )}
        <DropdownMenuSeparator />
        <NotAvailable className="flex"><DropdownMenuItem variant="destructive" disabled><Trash2 /> Delete</DropdownMenuItem></NotAvailable>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
