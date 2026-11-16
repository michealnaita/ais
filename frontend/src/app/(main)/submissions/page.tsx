import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import { RoleSubmissions } from "./components/RoleSubmissions";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "Submissions · AIS" };

export default function Page() {
  return <RequireRole roles={["student", "instructor"]}><RoleSubmissions /></RequireRole>;
}
