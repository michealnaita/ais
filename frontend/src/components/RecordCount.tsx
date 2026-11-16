/** Record count shown under a table: "12 submissions", or "Showing 3 of 12 submissions" when filtered. */
export function RecordCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  const label = (n: number) => `${n} ${noun}${n === 1 ? "" : "s"}`;
  return (
    <p className="mt-3 shrink-0 px-4 text-xs text-muted-foreground tabular-nums">
      {shown === total ? label(total) : `Showing ${shown} of ${label(total)}`}
    </p>
  );
}
