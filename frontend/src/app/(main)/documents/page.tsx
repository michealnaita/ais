import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import DocumentsPage from "./components/DocumentsPage";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export const metadata: Metadata = { title: "Documents · AIS" };

export default function Page() {
  return <RequireRole roles={["admin"]}><DocumentsPage /></RequireRole>;
}
