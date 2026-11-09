export type Severity = "info" | "warning" | "error";

export type LogEntry = {
  t: string;
  src: string;
  sev: Severity;
  msg: string;
};

export type LogFilter = "all" | Severity;
