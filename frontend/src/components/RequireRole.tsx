"use client";

/* Renders children only for the given roles; anyone else is sent to the dashboard. */
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ROUTES } from "@/lib/routes";
import type { Role } from "@/types/user";
import { useUser } from "@/context/UserProvider";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role } = useUser();
  const router = useRouter();
  const allowed = roles.includes(role);

  useEffect(() => {
    if (!allowed) router.replace(ROUTES.dashboard);
  }, [allowed, router]);

  return allowed ? children : null;
}
