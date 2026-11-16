import { FileIcon } from "@/components/FileIcon";
import { SimilarityBar } from "@/components/submissions/SimilarityBar";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";
import { formatSize } from "@/utils/formatSize";
import { initials } from "@/utils/initials";
import type { RepositoryDocument } from "../types";

export function DocumentRow({ doc }: { doc: RepositoryDocument }) {
  /* Uploads expire unless they're submitted or persisted by an admin. */
  const retention = doc.expiresAt ? `Expires ${formatDate(doc.expiresAt)}` : "Kept";
  return (
    <TableRow>
      {/* Takes the spare width; long names truncate, hover shows the full name. */}
      <TableCell className="w-full max-w-0 py-3.5">
        <div className="flex items-center gap-3">
          <FileIcon />
          <div className="min-w-0">
            <div className="truncate font-medium" title={doc.originalFileName}>{doc.originalFileName}</div>
            <div className="truncate text-xs text-muted-foreground">{formatSize(doc.size)} · {retention}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar><AvatarFallback>{initials(doc.authorName)}</AvatarFallback></Avatar>
          <span>{doc.authorName}</span>
        </div>
      </TableCell>
      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
      <TableCell><SubmissionStatusBadge status={doc.status} /></TableCell>
      <TableCell><SimilarityBar status={doc.status} score={doc.similarityScore} /></TableCell>
    </TableRow>
  );
}
