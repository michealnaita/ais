export type Role = "student" | "instructor" | "admin";

/** The signed-in user, as the UI needs it. */
export type CurrentUser = {
  id: number;
  role: Role;
  name: string;
  initials: string;
  /** Second line under the name in the sidebar user card. */
  sub: string;
};
