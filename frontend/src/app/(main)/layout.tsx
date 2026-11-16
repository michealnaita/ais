import { AppShell } from "@/components/layout/AppShell";

/* Every signed-in page renders inside the role's sidebar shell; /login sits outside this group.
   The root layout's ProtectedRoute only renders these pages once the session is loaded
   on the client, so each page sets `instant = false`. */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
