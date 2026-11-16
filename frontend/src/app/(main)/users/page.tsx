import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import UserManagementPage from "./components/UserManagementPage";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "User management · AIS" };

export default function Page() {
  return <RequireRole roles={["admin"]}><UserManagementPage /></RequireRole>;
}
