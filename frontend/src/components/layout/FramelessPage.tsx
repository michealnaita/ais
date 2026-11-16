"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useShellFrame } from "@/context/ShellFrameProvider";
import { cn } from "@/utils/cn";

/** Card surface matching the shell's content card, for pages laid out with FramelessPage. */
export const FLOATING_CARD = "rounded-2xl bg-background shadow-sm";

/**
 * Opts a page out of the shell's white content card so it can lay out its own floating
 * cards on the app background. Every other page keeps the card.
 *
 * Uses a layout effect rather than CSS `:has()`: with cacheComponents, Next keeps pages
 * you navigated away from in the DOM (hidden by React <Activity>), so a DOM marker would
 * leak onto the next page. The effect cleanup runs when Activity hides this page.
 */
export function FramelessPage({ children, className }: { children: ReactNode; className?: string }) {
  const { setFrameless } = useShellFrame();
  useLayoutEffect(() => {
    setFrameless(true);
    return () => setFrameless(false);
  }, [setFrameless]);

  return <div className={cn("flex min-w-0 flex-1 gap-2 overflow-hidden", className)}>{children}</div>;
}
