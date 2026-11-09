"use client";

import { useUser } from "@/context/UserProvider";
import AdminOverviewPage from "./admin/AdminOverviewPage";
import { InstructorDashboard } from "./InstructorDashboard";
import { StudentDashboard } from "./StudentDashboard";

export function RoleDashboard() {
  switch (useUser().role) {
    case "student": return <StudentDashboard />;
    case "instructor": return <InstructorDashboard />;
    case "admin": return <AdminOverviewPage />;
  }
}
