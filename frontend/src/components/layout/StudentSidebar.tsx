import { Inbox, LayoutGrid } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AppSidebar } from "./AppSidebar";
import type { NavItemConfig } from "./types";

const STUDENT_NAV: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: LayoutGrid },
  { key: "submissions", label: "Submissions", href: ROUTES.submissions, icon: Inbox },
];

export function StudentSidebar() {
  return <AppSidebar items={STUDENT_NAV} />;
}
