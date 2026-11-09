import type { Severity } from "../types";

const SEVERITY_TONE: Record<Severity, string> = {
  info: "bg-blue-bg text-blue-fg",
  warning: "bg-amber-bg text-amber-fg",
  error: "bg-red-bg text-red-fg",
};

export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex h-5 items-center rounded-md px-2 text-[11px] font-bold tracking-[.04em] ${SEVERITY_TONE[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
}
