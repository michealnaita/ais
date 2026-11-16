"use client";

/* Shared app sidebar built on the shadcn sidebar primitives. Role sidebars render
   this with their own nav items; the active item follows the current path. */
import { Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
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
import { AboutAisDialog } from "./AboutAisDialog";
import type { NavItemConfig } from "./types";
import { UserMenu } from "./UserMenu";

export type AppSidebarProps = {
  /** Links shown in the nav, in order. */
  items: NavItemConfig[];
  /** Optional caption above the nav, e.g. "Administration". */
  label?: string;
  /** Count bubbles keyed by NavItemConfig.key. */
  badges?: Record<string, number | undefined>;
};

export function AppSidebar({ items, label, badges }: AppSidebarProps) {
  const navProps = { items, badges };
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between px-3.5 pt-4 pb-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-2">
        {/* Full logo when expanded, the square AIS mark when collapsed. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="block h-[68px] w-auto group-data-[collapsible=icon]:hidden" src="/logo.png" alt="Academic Integrity System" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hidden size-11 group-data-[collapsible=icon]:block" src="/logo%20min.png" alt="AIS" />
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

      <SidebarFooter className="gap-1 px-3 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="About AIS" onClick={() => setAboutOpen(true)} className={NAV_BUTTON}>
              <Info />
              <span>About AIS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserMenu />
      </SidebarFooter>
      <AboutAisDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </Sidebar>
  );
}

const NAV_BUTTON = "h-10 gap-3 rounded-[9px] px-2.5 text-[14.5px] font-medium text-ink hover:bg-black/5 data-active:bg-white data-active:shadow-xs data-active:font-medium [&_svg]:size-5 [&_svg]:text-ink-secondary data-active:[&_svg]:text-ink group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2.5!";

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
              className={NAV_BUTTON}
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
