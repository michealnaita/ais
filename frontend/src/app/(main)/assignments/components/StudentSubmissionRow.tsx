import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { initials } from "@/utils/initials";
import { similarityColor } from "@/utils/similarity";

type StudentSubmissionRowProps = {
  submission: Submission;
  onOpen: (submission: Submission) => void;
};

export function StudentSubmissionRow({ submission: s, onOpen }: StudentSubmissionRowProps) {
  const complete = s.status === "complete";
  return (
    <TableRow className={complete ? "cursor-pointer" : undefined} onClick={() => { if (complete) onOpen(s); }}>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar><AvatarFallback>{initials(s.student)}</AvatarFallback></Avatar>
          <span>{s.student}</span>
        </div>
      </TableCell>
      <TableCell>{s.name}</TableCell>
      <TableCell><SubmissionStatusBadge status={s.status} /></TableCell>
      <TableCell className="text-right">
        {complete && s.score != null
          ? <span className="font-medium" style={{ color: similarityColor(s.score) }}>{s.score}%</span>
          : <span className="text-muted-foreground">—</span>}
      </TableCell>
    </TableRow>
  );
}
