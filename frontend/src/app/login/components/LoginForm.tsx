"use client";

/* Sign-in form. Any non-empty email/password "signs in" and redirects by role. */
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { LoginFieldLabel } from "./LoginFieldLabel";
import { PasswordField } from "./PasswordField";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { RoleToggle } from "./RoleToggle";
import { SsoButton } from "./SsoButton";
import type { LoginRole } from "../types";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailErr, setEmailErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [error, setError] = useState("");

  function go() {
    // TODO: sign in as `role` once auth exists; for now every role lands on its dashboard.
    router.push(ROUTES.dashboard);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setEmailErr(!email.trim());
      setPasswordErr(!password.trim());
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    go();
  }

  return (
    <form className="w-full max-w-[372px]" noValidate onSubmit={submit}>
      <img className="mx-auto mb-[30px] hidden h-[26px] max-[880px]:block" src="/assets/ais_logo.png" alt="AIS" />
      <h1 className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.01em]">Sign in</h1>
      <p className="mt-[9px] text-[14.5px] text-ink-secondary">Use your institution account to continue.</p>

      <RoleToggle value={role} onChange={setRole} />

      <div className="mb-4">
        <LoginFieldLabel htmlFor="email" label="Email" />
        <Input aria-invalid={emailErr} id="email" type="email" autoComplete="username" placeholder="you@university.edu"
          value={email} onChange={e => { setEmail(e.target.value); setEmailErr(false); setError(""); }} />
      </div>

      <PasswordField
        value={password}
        invalid={passwordErr}
        error={error}
        onChange={v => { setPassword(v); setPasswordErr(false); setError(""); }}
      />

      <RememberMeCheckbox checked={remember} onChange={setRemember} />

      <Button type="submit" size="lg" className="w-full">Sign in</Button>

      <div className="my-[22px] flex items-center gap-3.5 before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-['']">
        <span className="text-[12.5px] text-ink-tertiary">or</span>
      </div>

      <SsoButton onClick={go} />

      <p className="mt-[26px] text-center text-[13.5px] text-ink-tertiary">
        New to AIS? <a className="font-semibold text-ink-secondary hover:text-ink" href="#">Contact your administrator</a>
      </p>
    </form>
  );
}
