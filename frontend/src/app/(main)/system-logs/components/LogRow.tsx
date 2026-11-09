import { TableCell, TableRow } from "@/components/ui/table";
import type { LogEntry } from "../types";
import { SeverityTag } from "./SeverityTag";

export function LogRow({ entry }: { entry: LogEntry }) {
  return (
    <TableRow>
      <TableCell className="tabular-nums">{entry.t}</TableCell>
      <TableCell>{entry.src}</TableCell>
      <TableCell><SeverityTag severity={entry.sev} /></TableCell>
      {/* Messages can be long, so this column wraps; error lines use the destructive colour. */}
      <TableCell className={entry.sev === "error" ? "whitespace-normal text-destructive" : "whitespace-normal"}>{entry.msg}</TableCell>
    </TableRow>
  );
}
