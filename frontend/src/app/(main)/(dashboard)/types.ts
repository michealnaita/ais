import type { Tone } from "@/utils/tones";

export type SystemService = {
  name: string;
  up: boolean;
};

/** Entity a logged event is about: the part of its type before the dot ("submission.created"). */
export type FeedKind = "auth" | "user" | "assignment" | "document" | "submission" | "error";

export type UserCount = {
  tone: Tone;
  count: number;
  label: string;
};
