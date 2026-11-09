import type { Role } from "@/types/user";
export type { Role };

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type UserFormData = Pick<User, "name" | "email" | "role">;

export type UserFilter = "all" | Role | "deactivated";

export type UserAction = "edit" | "toggle";

export type UserModal =
  | { type: "create" }
  | { type: "edit"; u: User }
  | { type: "toggle"; u: User };
