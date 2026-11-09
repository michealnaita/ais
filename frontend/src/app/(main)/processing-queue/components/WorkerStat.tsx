import { cn } from "@/utils/cn";

type WorkerStatProps = {
  value: number;
  label: string;
  fail?: boolean;
};

export function WorkerStat({ value, label, fail }: WorkerStatProps) {
  return (
    <div className="text-right">
      <div className={cn("font-display text-[26px] leading-none font-medium tabular-nums", fail && "text-red-fg")}>{value}</div>
      <div className="mt-1 text-[11.5px] tracking-[.02em] text-ink-tertiary">{label}</div>
    </div>
  );
}
