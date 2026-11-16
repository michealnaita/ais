/* Submission status as a shadcn Badge in its status colour; processing shows a spinner instead of the dot. */
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { STATUS_BADGE_SIZE, SUBMISSION_STATUS_COLORS } from "@/utils/statusColors";
import { cn } from "@/utils/cn";
import { SUBMISSION_STATUS_LABEL, type SubmissionStatus } from "@/utils/submissionStatus";

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const processing = status === "queued";
  return (
    <Badge variant="secondary" dot={!processing} className={cn(STATUS_BADGE_SIZE, SUBMISSION_STATUS_COLORS[status])}>
      {processing && <Spinner data-icon="inline-start" />}
      {SUBMISSION_STATUS_LABEL[status]}
    </Badge>
  );
}
