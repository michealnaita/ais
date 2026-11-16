"use client";

/* Gates every page on the auth session: a loading screen while it's being checked, the
   page once authenticated, and otherwise a redirect to /login that remembers the page,
   so signing in returns there. Public routes (the login page) render as they are. */
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/UserProvider";
import { loginRoute, ROUTES } from "@/lib/routes";

const PUBLIC_ROUTES: string[] = [ROUTES.login];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isPublic = PUBLIC_ROUTES.includes(usePathname());
  const { loading, authenticated } = useAuth();
  const router = useRouter();
  const redirect = !isPublic && !loading && !authenticated;

  useEffect(() => {
    /* Read from window, not useSearchParams, so the root layout needs no Suspense boundary. */
    if (redirect) router.replace(loginRoute(window.location.pathname + window.location.search));
  }, [redirect, router]);

  if (isPublic || authenticated) return children;
  /* Also shown while the redirect to /login is under way. */
  return <LoadingScreen />;
}

function LoadingScreen() {
  return (
    <div className="flex h-svh items-center justify-center text-muted-foreground">
      <Spinner className="size-6" />
    </div>
  );
}
