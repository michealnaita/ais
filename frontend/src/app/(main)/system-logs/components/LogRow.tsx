import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/utils/formatDate";
import type { LogEntry } from "../types";
import { SeverityTag } from "./SeverityTag";

export function LogRow({ entry }: { entry: LogEntry }) {
  return (
    <TableRow>
      <TableCell className="tabular-nums" title={entry.timestamp}>{formatDateTime(entry.timestamp)}</TableCell>
      <TableCell>
        <div>{entry.source}</div>
        <div className="font-mono text-[11.5px] text-muted-foreground">{entry.type}</div>
      </TableCell>
      <TableCell><SeverityTag severity={entry.level} /></TableCell>
      {/* Messages can be long, so this column wraps; error lines use the destructive colour. */}
      <TableCell className={entry.level === "error" ? "whitespace-normal text-destructive" : "whitespace-normal"}>{entry.message}</TableCell>
    </TableRow>
  );
}
