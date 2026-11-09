"use client";

/* The shared submissions page showing the student's own submissions. */
import { useUser } from "@/context/UserProvider";
import { useStudentSubmissions } from "@/hooks/useSubmissions";
import { SubmissionsPage } from "./SubmissionsPage";

export function StudentSubmissions() {
  const user = useUser();
  const { data: rows = [], isPending } = useStudentSubmissions(user.id);

  return (
    <SubmissionsPage
      submissions={rows}
      loading={isPending}
      title="Submissions"
      subtitle="Track every document you've submitted for integrity review."
    />
  );
}
