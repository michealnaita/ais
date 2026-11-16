import type { Metadata } from "next";
import { IllustrationPanel } from "./components/IllustrationPanel";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = { title: "Sign in · AIS" };

/* Split screen: sign-in form on the left half, illustration on the right. */
export default function LoginPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <main className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto border-r border-line p-10 max-[880px]:border-r-0">
        <LoginForm />
      </main>
      <IllustrationPanel />
    </div>
  );
}
