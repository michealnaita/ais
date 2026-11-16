import type { LogLevel, SystemLog } from "@/types/api";

export type Severity = LogLevel;

export type LogEntry = SystemLog;

export type LogFilter = "all" | Severity;
