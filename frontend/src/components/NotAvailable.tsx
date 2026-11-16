"use client";

/* Wraps a control for a feature the backend doesn't support yet: the child should be
   rendered disabled; hovering explains why. Grep for NotAvailable to find them all. */
import type { ReactElement } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

type NotAvailableProps = {
  children: ReactElement;
  label?: string;
  /** Pass "flex" for full-width children such as menu items. */
  className?: string;
};

export function NotAvailable({ children, label = "Not available yet", className = "inline-flex" }: NotAvailableProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("cursor-not-allowed", className)} />}>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
