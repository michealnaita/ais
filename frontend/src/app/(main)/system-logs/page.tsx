import type { Metadata } from "next";
import { RequireRole } from "@/components/RequireRole";
import SystemLogsPage from "./components/SystemLogsPage";

export const metadata: Metadata = { title: "System logs · AIS" };

export default function Page() {
  return <RequireRole roles={["admin"]}><SystemLogsPage /></RequireRole>;
}
