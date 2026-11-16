import { ChevronLeft, Download, FileUp } from "lucide-react";
import { NotAvailable } from "@/components/NotAvailable";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { CARD_HEADER } from "../constants";
import type { ReportView } from "../types";

const Dot = () => <span className="size-[3px] rounded-full bg-[#c4c4c4]" />;

type ReportHeaderProps = {
  doc: string;
  student: string;
  assignment: string;
  /** Display date. */
  date: string;
  view: ReportView;
  onBack: () => void;
  /** Students only: opens the replace-document dialog. */
  onReplace?: () => void;
};

/* Header of the document card: back, title + metadata, download (and replace, for students). */
export function ReportHeader({ doc, student, assignment, date, view, onBack, onReplace }: ReportHeaderProps) {
  return (
    <div className={cn(CARD_HEADER, "gap-3 pr-5 pl-3")}>
      <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
        <ChevronLeft size={20} />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[22px] leading-[1.2] font-medium tracking-[-0.01em]">{doc}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-[9px] text-[13px] text-ink-secondary">
          {view === "instructor" && <><b className="font-semibold text-ink">{student}</b><Dot /></>}
          <span>{assignment}</span><Dot />
          <span>Submitted {date}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotAvailable>
          <Button variant="outline" disabled>
            <Download size={16} /> Download
          </Button>
        </NotAvailable>
        {onReplace && (
          <Button onClick={onReplace}>
            <FileUp size={16} /> Resubmit
          </Button>
        )}
      </div>
    </div>
  );
}
