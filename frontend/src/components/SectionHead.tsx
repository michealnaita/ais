import type { ReactNode } from "react";

/** Heading above a table/list, with an optional action on the right. */
export function SectionHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {children}
    </div>
  );
}
