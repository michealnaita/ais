import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import SystemLogsPage from "./components/SystemLogsPage";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "System logs · AIS" };

export default function Page() {
  return <RequireRole roles={["admin"]}><SystemLogsPage /></RequireRole>;
}
