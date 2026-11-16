import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireRole } from "@/components/RequireRole";
import { SubmissionReport } from "../components/SubmissionReport";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "Similarity report · AIS" };

/* The id is only known at request time, so it is read inside Suspense (cacheComponents). */
export default function Page({ params }: PageProps<"/similarity-report/[id]">) {
  return (
    <RequireRole roles={["student", "instructor"]}>
      <Suspense fallback={<div className="flex-1" />}>
        {params.then(({ id }) => <SubmissionReport id={id} />)}
      </Suspense>
    </RequireRole>
  );
}
