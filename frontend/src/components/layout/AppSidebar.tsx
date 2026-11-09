"use client";

/* Shared app sidebar built on the shadcn sidebar primitives. Role sidebars render
   this with their own nav items; the active item follows the current path. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserProvider";
import type { NavItemConfig } from "./types";

export type AppSidebarProps = {
  /** Links shown in the nav, in order. */
  items: NavItemConfig[];
  /** Optional caption above the nav, e.g. "Administration". */
  label?: string;
  /** Count bubbles keyed by NavItemConfig.key. */
  badges?: Record<string, number | undefined>;
};

export function AppSidebar({ items, label, badges }: AppSidebarProps) {
  const user = useUser();
  const navProps = { items, badges };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between px-3.5 pt-4 pb-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="block h-[25px] w-auto pl-1.5 group-data-[collapsible=icon]:hidden" src="/assets/ais_logo.png" alt="AIS" />
        <SidebarTrigger className="text-ink-tertiary hover:text-ink-secondary [&_svg]:size-5" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          {label && (
            <SidebarGroupLabel className="h-auto px-3 pt-2.5 pb-2 text-[11px] font-semibold tracking-[.07em] text-ink-tertiary uppercase">
              {label}
            </SidebarGroupLabel>
          )}
          {/* usePathname suspends on routes with unknown dynamic params (cacheComponents),
              so the static fallback renders the same links without an active state. */}
          <Suspense fallback={<Nav {...navProps} activeHref={null} />}>
            <ActiveNav {...navProps} />
          </Suspense>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user.name} className="h-[50px] gap-[11px] rounded-[11px] px-2 hover:bg-hover group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-135 from-[#3a3a3a] to-[#111] text-[13px] font-semibold text-white">
                {user.initials}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13.5px] leading-[1.3] font-semibold text-ink">{user.name}</span>
                <span className="truncate text-xs leading-[1.3] text-ink-tertiary">{user.sub}</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

type NavProps = Pick<AppSidebarProps, "items" | "badges">;

function ActiveNav(props: NavProps) {
  const pathname = usePathname();
  const active = props.items
    .filter(i => i.href === "/" ? pathname === "/" : pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return <Nav {...props} activeHref={active?.href ?? null} />;
}

function Nav({ items, badges, activeHref }: NavProps & { activeHref: string | null }) {
  return (
    <SidebarMenu>
      {items.map(({ key, label, href, icon: I }) => {
        const active = href === activeHref;
        const badge = badges?.[key];
        return (
          <SidebarMenuItem key={key}>
            <SidebarMenuButton
              render={<Link href={href} aria-current={active ? "page" : undefined} />}
              isActive={active}
              tooltip={label}
              className="h-10 gap-3 rounded-[9px] px-2.5 text-[14.5px] font-medium text-ink hover:bg-hover data-active:bg-active data-active:font-medium [&_svg]:size-5 [&_svg]:text-ink-secondary data-active:[&_svg]:text-ink group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2.5!"
            >
              <I />
              <span>{label}</span>
            </SidebarMenuButton>
            {badge ? (
              <SidebarMenuBadge className="top-2.5! right-2 h-[19px] min-w-[19px] rounded-full bg-red-bg px-1.5 text-[11.5px] font-bold text-red-fg">
                {badge}
              </SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
