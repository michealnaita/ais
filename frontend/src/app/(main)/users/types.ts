import type { CreateUserInput, UserResponse } from "@/types/api";
import type { Role } from "@/types/user";
export type { Role };

/** An account as the API lists it. It carries no role yet. */
export type User = UserResponse;

export type UserFormData = CreateUserInput;

export type UserFilter = "all" | Role | "deactivated";

export type UserAction = "deactivate";

export type UserModal =
  | { type: "create" }
  | { type: "deactivate"; u: User };
