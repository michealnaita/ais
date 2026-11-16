"use client";

/* Whether the app shell draws its white content card around the current page.
   On by default; a page opts out by rendering <FramelessPage>. */
import { createContext, useContext, useState, type ReactNode } from "react";

type ShellFrame = { frameless: boolean; setFrameless: (frameless: boolean) => void };

const ShellFrameContext = createContext<ShellFrame | null>(null);

export function ShellFrameProvider({ children }: { children: (frameless: boolean) => ReactNode }) {
  const [frameless, setFrameless] = useState(false);
  return <ShellFrameContext.Provider value={{ frameless, setFrameless }}>{children(frameless)}</ShellFrameContext.Provider>;
}

export function useShellFrame(): ShellFrame {
  const ctx = useContext(ShellFrameContext);
  if (!ctx) throw new Error("useShellFrame must be used inside ShellFrameProvider");
  return ctx;
}
