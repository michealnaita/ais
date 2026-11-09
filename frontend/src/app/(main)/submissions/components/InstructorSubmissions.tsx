"use client";

/* The shared submissions page showing every student's work across the instructor's assignments. */
import { useInstructorSubmissions } from "@/hooks/useSubmissions";
import { SubmissionsPage } from "./SubmissionsPage";

export function InstructorSubmissions() {
  const { data = [], isPending } = useInstructorSubmissions();
  return (
    <SubmissionsPage
      submissions={data}
      loading={isPending}
      showStudent
      title="Submissions"
      subtitle="All student submissions across your assignments."
    />
  );
}
