import type { EnrolledAssignment } from "@/types/enrolledAssignment";

export function AssignmentMetaGrid({ assignment: a }: { assignment: EnrolledAssignment }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-[18px] [&_dd]:text-sm [&_dd]:font-medium [&_dd]:text-ink [&_dt]:mb-[3px] [&_dt]:text-xs [&_dt]:text-ink-tertiary">
      <div><dt>Instructor</dt><dd>{a.instructor}</dd></div>
      <div><dt>Length</dt><dd>{a.words}</dd></div>
      <div><dt>Accepted files</dt><dd>{a.fileTypes}</dd></div>
      <div><dt>Max size</dt><dd>{a.maxSize}</dd></div>
    </dl>
  );
}
