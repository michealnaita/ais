import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import { RoleSubmissions } from "./components/RoleSubmissions";

export const metadata: Metadata = { title: "Submissions · AIS" };

export default function Page() {
  return <RequireRole roles={["student", "instructor"]}><RoleSubmissions /></RequireRole>;
}
