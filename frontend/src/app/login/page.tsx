import type { Metadata } from "next";
import { BrandPanel } from "./components/BrandPanel";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = { title: "Sign in · AIS" };

export default function LoginPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <BrandPanel />
      <main className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto p-10">
        <LoginForm />
      </main>
    </div>
  );
}
