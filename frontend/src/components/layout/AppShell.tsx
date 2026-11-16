"use client";

/* App frame: the current role's sidebar next to the routed page. */
import type { CSSProperties, ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShellFrameProvider } from "@/context/ShellFrameProvider";
import { useUser } from "@/context/UserProvider";
import { cn } from "@/utils/cn";
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
        <ShellFrameProvider>
          {frameless => (
            /* The white content card; a page wrapped in <FramelessPage> hides it and draws its own. */
            <SidebarInset className={cn("min-w-0 flex-row overflow-hidden md:py-2", frameless && "bg-transparent! shadow-none!")}>
              {/* Below md the sidebar becomes a sheet; this is its only opener. */}
              <SidebarTrigger className="fixed top-3 left-3 z-20 bg-white md:hidden" />
              {children}
            </SidebarInset>
          )}
        </ShellFrameProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
