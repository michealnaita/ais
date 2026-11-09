import { ClipboardList, Inbox, LayoutGrid } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AppSidebar } from "./AppSidebar";
import type { NavItemConfig } from "./types";

const INSTRUCTOR_NAV: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", href: ROUTES.dashboard, icon: LayoutGrid },
  { key: "assignments", label: "Assignments", href: ROUTES.assignments, icon: ClipboardList },
  { key: "submissions", label: "Submissions", href: ROUTES.submissions, icon: Inbox },
];

export function InstructorSidebar() {
  return <AppSidebar items={INSTRUCTOR_NAV} />;
}
