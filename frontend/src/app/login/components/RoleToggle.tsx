import type { LoginRole } from "../types";
import { Button } from "@/components/ui/button";

const ROLES: { key: LoginRole; label: string }[] = [
  { key: "student", label: "Student" },
  { key: "instructor", label: "Instructor" },
];

type RoleToggleProps = {
  value: LoginRole;
  onChange: (role: LoginRole) => void;
};

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="mt-[26px] mb-[22px] flex gap-1 rounded-xl border border-line bg-panel p-1" role="tablist" aria-label="Account type">
      {ROLES.map(r => (
        <Button
          key={r.key}
          variant={value === r.key ? "secondary" : "ghost"}
          role="tab"
          aria-selected={value === r.key}
          className="flex-1"
          onClick={() => onChange(r.key)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}
