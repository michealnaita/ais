import { AppShell } from "@/components/layout/AppShell";

/* Every signed-in page renders inside the role's sidebar shell; /login sits outside this group. */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
