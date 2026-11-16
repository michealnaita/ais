import { ClipboardList, FileText, Inbox, KeyRound, TriangleAlert, UserPlus, type LucideIcon } from "lucide-react";
import type { FeedKind } from "./types";

/** Icon per activity-feed event (shown on a neutral tile). */
export const FEED_STYLE: Record<FeedKind, { icon: LucideIcon }> = {
  auth: { icon: KeyRound },
  user: { icon: UserPlus },
  assignment: { icon: ClipboardList },
  document: { icon: FileText },
  submission: { icon: Inbox },
  error: { icon: TriangleAlert },
};

/** Shared surface for the admin overview stat cards. */
export const STAT_CARD = "bg-stone shadow-none ring-0";
