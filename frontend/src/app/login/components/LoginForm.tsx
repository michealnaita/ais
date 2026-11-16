"use client";

/* Email and password sign-in against the API; the account decides the role. */
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/UserProvider";
import { isApiError } from "@/lib/api";
import { afterLoginRoute, NEXT_PARAM } from "@/lib/routes";
import { login } from "@/services/auth";
import { LoginFieldLabel } from "./LoginFieldLabel";
import { PasswordField } from "./PasswordField";
import { RememberMeCheckbox } from "./RememberMeCheckbox";

export function LoginForm() {
  const router = useRouter();
  const { reload } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailErr, setEmailErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setEmailErr(!email.trim());
      setPasswordErr(!password.trim());
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await login({ email: email.trim(), password });
      await reload();
      /* Back to the page that sent them here, if any (read at submit, so no Suspense is needed). */
      router.replace(afterLoginRoute(new URLSearchParams(window.location.search).get(NEXT_PARAM)));
    } catch (err) {
      setPending(false);
      if (isApiError(err, 404)) {
        setEmailErr(true);
        setError("No account found for that email.");
      } else if (isApiError(err, 401)) {
        setPasswordErr(true);
        setError("Incorrect password.");
      } else if (isApiError(err, 403)) {
        setError("This account has been deactivated. Contact your administrator.");
      } else if (isApiError(err, 422)) {
        setEmailErr(true);
        setError("Enter a valid email address.");
      } else {
        setError("Couldn't sign in. Please try again.");
      }
    }
  }

  return (
    <form className="w-full max-w-[372px]" noValidate onSubmit={submit}>
      <img className="mb-10 block h-16 w-auto" src="/logo.png" alt="Academic Integrity System" />
      <h1 className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.01em]">Sign in</h1>
      <p className="mt-[9px] mb-7 text-[14.5px] text-ink-secondary">Use your institution email and password.</p>

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

      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>

      <p className="mt-[26px] text-center text-[13.5px] text-ink-tertiary">
        New to AIS? <a className="font-semibold text-ink-secondary hover:text-ink" href="#">Contact your administrator</a>
      </p>
    </form>
  );
}
