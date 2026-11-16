import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table, TableBody } from "@/components/ui/table";
import type { Submission } from "@/types/submission";
import { SubmissionRow } from "./SubmissionRow";

const base: Submission = {
  id: "s1",
  documentId: "d1",
  fileName: "Final_Essay.docx",
  assignmentTitle: "Essay 2",
  submittedAt: "2026-05-28T12:00:00Z",
  documentStatus: "processed",
  documentSimilarity: 44,
  documentSize: 342 * 1024,
  submittedBy: "Ada Lovelace",
  similarityThreshold: 80,
};

function renderRow(props: Partial<React.ComponentProps<typeof SubmissionRow>> = {}) {
  const onOpen = vi.fn();
  render(
    <Table>
      <TableBody>
        <SubmissionRow submission={base} layout="student" onOpen={onOpen} {...props} />
      </TableBody>
    </Table>,
  );
  return { onOpen };
}

describe("SubmissionRow", () => {
  it("shows the document, date and similarity score", () => {
    renderRow();
    expect(screen.getByText("Final_Essay.docx")).toBeInTheDocument();
    expect(screen.getByText("May 28, 2026")).toBeInTheDocument();
    expect(screen.getByText("44%")).toBeInTheDocument();
  });

  it("opens the report when a completed row is clicked", async () => {
    const { onOpen } = renderRow();
    await userEvent.click(screen.getByText("Final_Essay.docx"));
    expect(onOpen).toHaveBeenCalledWith(base);
  });

  it("does not open rows that are still processing", async () => {
    const { onOpen } = renderRow({ submission: { ...base, documentStatus: "queued", documentSimilarity: null } });
    await userEvent.click(screen.getByText("Final_Essay.docx"));
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByText("44%")).not.toBeInTheDocument();
  });

  it("puts the assignment under the file name when inlineAssignment is set", () => {
    renderRow({ inlineAssignment: true });
    expect(screen.getByText("Essay 2 · 342 KB")).toBeInTheDocument();
  });

  it("shows the student column outside the student layout", () => {
    renderRow({ layout: "instructor" });
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });
});
