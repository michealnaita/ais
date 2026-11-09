import type { ReactNode } from "react";

/** Main column with a sticky side panel; the panel moves on top below the xl breakpoint. Without `aside`, main takes the full width. */
export function ContentSplit({ main, aside }: { main: ReactNode; aside?: ReactNode }) {
  if (!aside) return <>{main}</>;
  return (
    <div className="flex flex-col items-start gap-[34px] xl:flex-row">
      <div className="w-full min-w-0 xl:flex-1">{main}</div>
      <div className="order-first w-full shrink-0 xl:sticky xl:top-0 xl:order-none xl:w-[312px]">{aside}</div>
    </div>
  );
}
