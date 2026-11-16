import { FileText, LayoutGrid, List, Users } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { AppSidebar } from "./AppSidebar";
import type { NavItemConfig } from "./types";

const ADMIN_NAV: NavItemConfig[] = [
  { key: "overview", label: "Overview", href: ROUTES.dashboard, icon: LayoutGrid },
  { key: "users", label: "User management", href: ROUTES.users, icon: Users },
  { key: "documents", label: "Documents", href: ROUTES.documents, icon: FileText },
  { key: "logs", label: "System logs", href: ROUTES.systemLogs, icon: List },
];

export function AdminSidebar() {
  return <AppSidebar items={ADMIN_NAV} label="Administration" />;
}
