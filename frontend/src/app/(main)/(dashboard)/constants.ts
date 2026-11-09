import { Check, Inbox, TriangleAlert, UserPlus, type LucideIcon } from "lucide-react";
import type { FeedKind } from "./types";
import type { Tone } from "@/utils/tones";

export const FEED_STYLE: Record<FeedKind, { tone: Tone; icon: LucideIcon }> = {
  submission: { tone: "blue", icon: Inbox },
  complete: { tone: "green", icon: Check },
  failed: { tone: "red", icon: TriangleAlert },
  user: { tone: "violet", icon: UserPlus },
};
