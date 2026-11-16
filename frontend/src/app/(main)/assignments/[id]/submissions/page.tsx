import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireRole } from "@/components/RequireRole";
import { AssignmentSubmissions } from "../../components/AssignmentSubmissions";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "Assignment submissions · AIS" };

/* The id is only known at request time, so it is read inside Suspense (cacheComponents). */
export default function Page({ params }: PageProps<"/assignments/[id]/submissions">) {
  return (
    <RequireRole roles={["instructor"]}>
      <Suspense fallback={<div className="flex-1" />}>
        {params.then(({ id }) => <AssignmentSubmissions id={id} />)}
      </Suspense>
    </RequireRole>
  );
}
