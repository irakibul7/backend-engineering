import { describe, expect, it } from "vitest";
import { dispatch, type RouteDefinition } from "./routing";

const routes: RouteDefinition[] = [
  { id: "show-user", method: "GET", pattern: "/users/:userId" },
  { id: "current-user", method: "GET", pattern: "/users/me" },
  { id: "replace-current-user", method: "PUT", pattern: "/users/me" },
];

describe("routing example", () => {
  it("prefers a literal route over a parameter route regardless of registration order", () => {
    expect(dispatch(routes, "GET", "/users/me")).toEqual({
      kind: "matched",
      routeId: "current-user",
      params: {},
      headOnly: false,
    });
  });

  it("extracts and decodes path parameters once", () => {
    expect(dispatch(routes, "GET", "/users/rakibul%20islam")).toMatchObject({
      kind: "matched",
      routeId: "show-user",
      params: { userId: "rakibul islam" },
    });
  });

  it("returns not found when no path pattern matches", () => {
    expect(dispatch(routes, "GET", "/orders/42")).toEqual({ kind: "not-found" });
  });

  it("returns allowed methods for the most specific matched path", () => {
    expect(dispatch(routes, "DELETE", "/users/me")).toEqual({
      kind: "method-not-allowed",
      allowedMethods: ["GET", "HEAD", "PUT"],
    });
  });

  it("uses GET dispatch for HEAD while identifying the bodyless response", () => {
    expect(dispatch(routes, "HEAD", "/users/me")).toEqual({
      kind: "matched",
      routeId: "current-user",
      params: {},
      headOnly: true,
    });
  });

  it("rejects malformed percent encoding at the request boundary", () => {
    expect(dispatch(routes, "GET", "/users/%E0%A4%A")).toEqual({ kind: "not-found" });
  });
});
