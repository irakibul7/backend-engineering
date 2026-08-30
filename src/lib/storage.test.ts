import { beforeEach, describe, expect, it } from "vitest";
import { readNote, readProgress, readTheme, writeNote, writeProgress, writeTheme } from "./storage";

describe("browser storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists only known completed chapters", () => {
    writeProgress(new Set(["http-as-a-state-machine", "unknown"]));

    expect([...readProgress(new Set(["http-as-a-state-machine"]))]).toEqual(["http-as-a-state-machine"]);
  });

  it("recovers safely from malformed progress and theme data", () => {
    window.localStorage.setItem("bfp:progress:v1", "not-json");
    window.localStorage.setItem("bfp:preferences:v1", JSON.stringify({ theme: "neon" }));

    expect(readProgress(new Set(["http-as-a-state-machine"])).size).toBe(0);
    expect(readTheme()).toBe("light");
  });

  it("round-trips theme and private Markdown notes", () => {
    expect(writeTheme("original")).toBe(true);
    expect(writeNote("master", "# Systems\n\nRemember the boundary.")).toBe(true);

    expect(readTheme()).toBe("original");
    expect(readNote("master")).toContain("Remember the boundary");
  });
});
