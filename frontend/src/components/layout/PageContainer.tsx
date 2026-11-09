import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Scrollable main column; content sits in Tailwind's `container` (see globals.css). */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <div className={cn("container pt-10 pb-20", className)}>
        {children}
      </div>
    </div>
  );
}
