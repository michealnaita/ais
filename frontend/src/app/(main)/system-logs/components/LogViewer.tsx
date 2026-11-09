/* Terminal-style log panel: file bar, column header, entries. */
import { List } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { LogEntry } from "../types";
import { LogRow } from "./LogRow";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type LogViewerProps = {
  entries: LogEntry[];
  total: number;
  loading?: boolean;
};

export function LogViewer({ entries, total, loading }: LogViewerProps) {
  return (
    <div className="mt-[18px] overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-panel px-4 py-3">
        <List size={16} />
        <span className="text-[13px] font-semibold">ais.system.log</span>
        <span className="ml-auto text-[12.5px] text-ink-tertiary">{entries.length} of {total} entries · today</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Empty><EmptyHeader><EmptyMedia variant="icon"><List /></EmptyMedia><EmptyTitle>{loading ? "Loading logs…" : "No log entries match this view."}</EmptyTitle></EmptyHeader></Empty>
              </TableCell>
            </TableRow>
          ) : entries.map((l, i) => <LogRow key={i} entry={l} />)}
        </TableBody>
      </Table>
    </div>
  );
}
