"use client";

import { useUser } from "@/context/UserProvider";
import { InstructorSubmissions } from "./InstructorSubmissions";
import { StudentSubmissions } from "./StudentSubmissions";

export function RoleSubmissions() {
  return useUser().role === "instructor" ? <InstructorSubmissions /> : <StudentSubmissions />;
}
