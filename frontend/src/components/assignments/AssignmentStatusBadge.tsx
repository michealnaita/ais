import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/types/assignment";
import { ASSIGNMENT_STATUS_COLORS, STATUS_BADGE_SIZE } from "@/utils/statusColors";
import { cn } from "@/utils/cn";

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  open: "Open",
  closed: "Closed",
};

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  return <Badge variant="secondary" dot className={cn(STATUS_BADGE_SIZE, ASSIGNMENT_STATUS_COLORS[status])}>{STATUS_LABEL[status]}</Badge>;
}
