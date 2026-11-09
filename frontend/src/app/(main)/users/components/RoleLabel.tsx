import { TONE } from "@/utils/tones";
import { ROLE_META } from "../constants";
import type { Role } from "../types";

export function RoleLabel({ role }: { role: Role }) {
  const m = ROLE_META[role];
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink">
      <span className={`size-2 rounded-full ${TONE[m.tone].dot}`} />{m.label}
    </span>
  );
}
