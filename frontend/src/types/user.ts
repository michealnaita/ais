import type { UserRole } from "./api";

export type Role = UserRole;

/** Claims the backend puts in the session token (its AuthJWTPayload). */
export type SessionClaims = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

/** The signed-in user, as the UI needs it. */
export type CurrentUser = SessionClaims & {
  name: string;
  initials: string;
};
