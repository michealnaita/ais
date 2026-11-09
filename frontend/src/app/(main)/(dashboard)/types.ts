import type { Tone } from "@/utils/tones";

export type SystemService = {
  name: string;
  sub: string;
  icon: "server" | "database" | "cpu";
  up: boolean;
  detail: string;
};

export type FeedKind = "submission" | "complete" | "failed" | "user";

export type FeedEvent = {
  kind: FeedKind;
  /** [lead, bold subject, trailing] */
  text: [string, string, string];
  time: string;
};

export type UserCount = {
  tone: Tone;
  count: string;
  label: string;
};

export type AdminOverview = {
  systems: SystemService[];
  feed: FeedEvent[];
  userCounts: UserCount[];
  failedJobs: number;
};
