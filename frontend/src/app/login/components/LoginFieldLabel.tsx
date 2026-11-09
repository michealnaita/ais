import type { ReactNode } from "react";

/** Label row above a login input, with an optional link on the right. */
export function LoginFieldLabel({ htmlFor, label, children }: { htmlFor: string; label: string; children?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <label className="text-[13px] font-semibold text-ink-secondary" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
