import type { ReactNode } from "react";

/** Search (or caption) on the left, filter tabs on the right, above a table. */
export function FilterRow({ children }: { children: ReactNode }) {
  return <div className="mb-1 flex items-center justify-between gap-[18px]">{children}</div>;
}
