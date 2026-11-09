import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Cell content: icon, bold title and a muted caption, ellipsized. */
export function TitleCell({ icon, title, caption, className }: { icon: ReactNode; title: ReactNode; caption: ReactNode; className?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {icon}
      <div className="min-w-0">
        <div className={cn("truncate font-medium", className)}>{title}</div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </div>
    </div>
  );
}

/** Square icon shown at the start of assignment / job rows. */
export function RowIcon({ children }: { children: ReactNode }) {
  return <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">{children}</span>;
}
