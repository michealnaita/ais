/* HTTP client for the FastAPI backend, reached through the /api rewrite in next.config.ts. */
import axios, { AxiosError } from "axios";

/** A failed API call. `message` is FastAPI's `detail` flattened to readable text;
    `detail` keeps the original (a string, a 422 error list, or a structured object). */
export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

type FastApiDetail = string | { msg: string }[] | { message?: string } | undefined;

function detailMessage(detail: FastApiDetail, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join("; ");
  return detail?.message ?? fallback;
}

export const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.response.use(undefined, (error: AxiosError<{ detail?: FastApiDetail }>) => {
  const status = error.response?.status ?? 0;
  /* Auth calls report their own failures (the login form, useAuthSession). */
  const isAuthCall = error.config?.url?.startsWith("/auth/");
  if (status === 401 && !isAuthCall && typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
  const detail = error.response?.data?.detail;
  return Promise.reject(new ApiError(status, detailMessage(detail, error.message), detail));
});

/** True when `error` is an ApiError with one of the given statuses. */
export function isApiError(error: unknown, ...statuses: number[]): error is ApiError {
  return error instanceof ApiError && (statuses.length === 0 || statuses.includes(error.status));
}
