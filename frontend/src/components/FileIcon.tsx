import { File } from "lucide-react";
import { cn } from "@/utils/cn";

/* Plain file icon, the same for every file type. */
export function FileIcon({ className }: { className?: string }) {
  return <File aria-hidden="true" size={22} strokeWidth={1.6} className={cn("shrink-0 text-muted-foreground", className)} />;
}
