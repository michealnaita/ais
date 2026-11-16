/* TanStack Query keys, in one place so mutations can invalidate them. */
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  assignments: ["assignments"] as const,
  assignmentEnrollments: (assignmentId: string) => ["assignments", "enrollments", assignmentId] as const,
  submissions: {
    all: ["submissions"] as const,
    list: (filters: { userId?: string; assignmentId?: string }) => ["submissions", "list", filters] as const,
    detail: (id: string) => ["submissions", "detail", id] as const,
  },
  /* Under the submission's key so replacing or re-thresholding it invalidates both. */
  similarityReport: (submissionId: string) => ["submissions", "detail", submissionId, "similarity-report"] as const,
  htmlPreview: (submissionId: string) => ["submissions", "detail", submissionId, "html-preview"] as const,
  users: ["users"] as const,
  documents: ["documents"] as const,
  logs: ["logs"] as const,
};
