"use client";

/* App frame: the current role's sidebar next to the routed page. */
import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserProvider";
import type { Role } from "@/types/user";
import { AdminSidebar } from "./AdminSidebar";
import { InstructorSidebar } from "./InstructorSidebar";
import { StudentSidebar } from "./StudentSidebar";

const SIDEBARS: Record<Role, () => ReactNode> = {
  student: StudentSidebar,
  instructor: InstructorSidebar,
  admin: AdminSidebar,
};

const SIDEBAR_SIZE = { "--sidebar-width": "268px", "--sidebar-width-icon": "64px" } as CSSProperties;

export function AppShell({ children }: { children: ReactNode }) {
  const RoleSidebar = SIDEBARS[useUser().role];
  return (
    <TooltipProvider>
      <SidebarProvider style={SIDEBAR_SIZE} className="h-svh overflow-hidden">
        <RoleSidebar />
        <SidebarInset className="min-w-0 flex-row overflow-hidden md:py-2">
          {/* Below md the sidebar becomes a sheet; this is its only opener. */}
          <SidebarTrigger className="fixed top-3 left-3 z-20 bg-white md:hidden" />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
