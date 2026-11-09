"use client";

/* Password input with show/hide toggle. Error text is rendered beneath it. */
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { LoginFieldLabel } from "./LoginFieldLabel";

type PasswordFieldProps = {
  value: string;
  invalid: boolean;
  error: string;
  onChange: (value: string) => void;
};

export function PasswordField({ value, invalid, error, onChange }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const EyeIcon = show ? EyeOff : Eye;
  return (
    <div className="mb-4">
      <LoginFieldLabel htmlFor="password" label="Password">
        <a className="text-[13px] font-semibold text-ink-secondary hover:text-ink" href="#" onClick={e => e.preventDefault()}>Forgot?</a>
      </LoginFieldLabel>
      <InputGroup>
        <InputGroupInput
          id="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={invalid}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(s => !s)}>
            <EyeIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="mt-[9px] text-[13px] font-medium text-red-fg">{error}</div>
    </div>
  );
}
