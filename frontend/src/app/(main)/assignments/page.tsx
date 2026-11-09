import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import AssignmentsPage from "./components/AssignmentsPage";

export const metadata: Metadata = { title: "Assignments · AIS" };

export default function Page() {
  return <RequireRole roles={["instructor"]}><AssignmentsPage /></RequireRole>;
}
