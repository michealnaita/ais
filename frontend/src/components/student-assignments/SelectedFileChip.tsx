import { X } from "lucide-react";
import { FileIcon } from "@/components/FileIcon";
import { Button } from "@/components/ui/button";
import { formatSize } from "@/utils/formatSize";

type SelectedFileChipProps = {
  file: File;
  onRemove: () => void;
};

export function SelectedFileChip({ file, onRemove }: SelectedFileChipProps) {
  return (
    <div className="flex items-center gap-[13px] rounded-[14px] border border-line-strong bg-white px-3.5 py-3">
      <FileIcon />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{file.name}</div>
        <div className="mt-px text-[12.5px] text-ink-tertiary">{formatSize(file.size)}</div>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove file"><X size={16} /></Button>
    </div>
  );
}
