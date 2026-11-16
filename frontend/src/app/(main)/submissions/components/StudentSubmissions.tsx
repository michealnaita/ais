"use client";

/* The shared submissions page showing the student's own submissions. */
import { useMySubmissions } from "@/hooks/useSubmissions";
import { SubmissionsPage } from "@/components/submissions/SubmissionsPage";

export function StudentSubmissions() {
  const { data: rows = [], isPending } = useMySubmissions();

  return (
    <SubmissionsPage
      submissions={rows}
      loading={isPending}
      title="Submissions"
      subtitle="Track every document you've submitted for integrity review."
    />
  );
}
