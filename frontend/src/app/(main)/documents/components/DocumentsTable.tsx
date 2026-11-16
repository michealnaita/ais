import { FileText } from "lucide-react";
import { RecordCount } from "@/components/RecordCount";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RepositoryDocument } from "../types";
import { DocumentRow } from "./DocumentRow";

type DocumentsTableProps = {
  documents: RepositoryDocument[];
  /** Unfiltered total, for the record count under the table. */
  total: number;
  loading?: boolean;
};

export function DocumentsTable({ documents, total, loading }: DocumentsTableProps) {
  return (
    /* Fills what the page leaves and scrolls only the body (the page uses PageContainer `fill`). */
    <div className="mt-[18px] flex min-h-0 flex-col">
      <Table scrollBody>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Similarity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Empty><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>{loading ? "Loading documents…" : "No documents match this view."}</EmptyTitle></EmptyHeader></Empty>
              </TableCell>
            </TableRow>
          ) : documents.map(d => <DocumentRow key={d.id} doc={d} />)}
        </TableBody>
      </Table>
      {!loading && <RecordCount shown={documents.length} total={total} noun="document" />}
    </div>
  );
}
