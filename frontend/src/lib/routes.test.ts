import { describe, expect, it } from "vitest";
import { afterLoginRoute, loginRoute } from "./routes";

describe("loginRoute", () => {
  it("remembers the page to return to", () => {
    expect(loginRoute("/assignments/a1/submissions?tab=x")).toBe("/login?next=%2Fassignments%2Fa1%2Fsubmissions%3Ftab%3Dx");
  });
  it("doesn't point login back at itself", () => {
    expect(loginRoute("/login")).toBe("/login");
    expect(loginRoute()).toBe("/login");
  });
});

describe("afterLoginRoute", () => {
  it("returns to an in-app path, keeping its query", () => {
    expect(afterLoginRoute("/similarity-report/s1?x=1")).toBe("/similarity-report/s1?x=1");
  });
  it("round-trips through loginRoute", () => {
    const next = new URL(loginRoute("/users?q=a b"), "http://x").searchParams.get("next");
    expect(afterLoginRoute(next)).toBe("/users?q=a%20b");
  });
  it.each([null, "", "https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "/login", "users"])(
    "falls back to the dashboard for %j", next => {
      expect(afterLoginRoute(next)).toBe("/");
    });
});
