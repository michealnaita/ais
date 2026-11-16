import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import AssignmentsPage from "./components/AssignmentsPage";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "Assignments · AIS" };

export default function Page() {
  return <RequireRole roles={["instructor"]}><AssignmentsPage /></RequireRole>;
}
