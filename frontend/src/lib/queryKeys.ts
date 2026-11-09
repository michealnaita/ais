/* TanStack Query keys, in one place so mutations can invalidate them. */
export const queryKeys = {
  assignments: ["assignments"] as const,
  submissions: {
    all: ["submissions"] as const,
    student: (studentId: number) => ["submissions", "student", studentId] as const,
    instructor: ["submissions", "instructor"] as const,
    assignment: (name: string) => ["submissions", "assignment", name] as const,
    detail: (id: number) => ["submissions", "detail", id] as const,
  },
  enrolledAssignments: ["enrolled-assignments"] as const,
  similarityReport: (submissionId: number) => ["similarity-report", submissionId] as const,
  users: ["users"] as const,
  logs: ["logs"] as const,
  adminOverview: ["admin-overview"] as const,
  processingQueue: ["processing-queue"] as const,
};
