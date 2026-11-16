"use client";

/* Sidebar footer user button. Opens a menu with the user's details, role and sign out. */
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth, useUser } from "@/context/UserProvider";
import { ROUTES } from "@/lib/routes";
import { logout } from "@/services/auth";
import type { CurrentUser, Role } from "@/types/user";

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator",
};

export function UserMenu() {
  const user = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { reload } = useAuth();
  const { isMobile } = useSidebar();

  async function signOut() {
    await logout().catch(() => undefined);
    queryClient.clear();
    /* Leave first, so this page doesn't flash the loading screen; then mark the session signed out. */
    router.replace(ROUTES.login);
    await reload();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-[50px] gap-[11px] rounded-[11px] px-2 hover:bg-black/5 data-popup-open:bg-black/5 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!"
              />
            }
          >
            <UserAvatar user={user} />
            <UserText user={user} />
            <ChevronsUpDown className="ml-auto size-4 text-ink-tertiary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="min-w-64">
            <div className="flex items-center gap-[11px] px-2.5 py-2">
              <UserAvatar user={user} />
              <UserText user={user} />
            </div>
            <div className="flex items-center justify-between px-2.5 pt-1 pb-2.5 text-xs text-muted-foreground">
              Signed in as
              <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={signOut}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserAvatar({ user }: { user: CurrentUser }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-135 from-[#3a3a3a] to-[#111] text-[13px] font-semibold text-white">
      {user.initials}
    </span>
  );
}

function UserText({ user }: { user: CurrentUser }) {
  return (
    <span className="flex min-w-0 flex-col text-left">
      <span className="truncate text-[13.5px] leading-[1.3] font-semibold text-ink">{user.name}</span>
      <span className="truncate text-xs leading-[1.3] text-ink-tertiary">{user.email}</span>
    </span>
  );
}
