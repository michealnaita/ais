import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import UserManagementPage from "./components/UserManagementPage";

export const metadata: Metadata = { title: "User management · AIS" };

export default function Page() {
  return <RequireRole roles={["admin"]}><UserManagementPage /></RequireRole>;
}
