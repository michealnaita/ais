import { RoleDashboard } from "./components/RoleDashboard";

/* Renders client-side once ProtectedRoute has loaded the session; see (main)/layout.tsx. */
export const instant = false;

export default function DashboardPage() {
  return <RoleDashboard />;
}
