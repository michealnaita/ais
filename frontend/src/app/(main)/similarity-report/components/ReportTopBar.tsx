import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReportTopBarProps = {
  onBack: () => void;
  onDownload: () => void;
};

export function ReportTopBar({ onBack, onDownload }: ReportTopBarProps) {
  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-line px-[26px]">
      <Button
        variant="ghost"
        onClick={onBack}
      >
        <ChevronLeft size={17} /> Back
      </Button>
      <div className="flex items-center gap-3">
        <span className="flex h-8 items-center gap-2 rounded-full bg-green-bg px-[13px] text-[13px] font-semibold text-green-fg">
          <span className="size-[7px] rounded-full bg-green-dot" /> Analysis complete
        </span>
        <Button
          variant="outline"
          onClick={onDownload}
        >
          <Download size={16} /> Download report
        </Button>
      </div>
    </div>
  );
}
