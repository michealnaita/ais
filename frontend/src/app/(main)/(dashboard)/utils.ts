import type { AdminDashboard, SystemLog } from "@/types/api";
import { FEED_STYLE } from "./constants";
import type { FeedKind, SystemService, UserCount } from "./types";

export function systemServices(health: AdminDashboard["systemHealth"]): SystemService[] {
  return [
    { name: "API", up: health.serverStatus === "running" },
    { name: "Database", up: health.databaseStatus === "running" },
    { name: "Worker", up: health.workerStatus === "running" },
  ];
}

export function userCounts(users: AdminDashboard["users"]): UserCount[] {
  return [
    { tone: "blue", count: users.students, label: "students" },
    { tone: "green", count: users.instructors, label: "instructors" },
    { tone: "violet", count: users.admins, label: "admins" },
  ];
}

/** Errors and warnings stand out; otherwise the icon follows the entity in the log type. */
export function feedKind(log: SystemLog): FeedKind {
  if (log.level !== "info") return "error";
  const entity = log.type.split(".")[0];
  return entity in FEED_STYLE ? (entity as FeedKind) : "auth";
}
