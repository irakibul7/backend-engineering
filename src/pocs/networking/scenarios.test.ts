import { describe, expect, it } from "vitest";
import {
  NETWORK_SCENARIOS,
  createInitialEvidence,
  nextEvidence,
  previousEvidence,
  selectEvidenceStep,
  selectScenario,
} from "./scenarios";

describe("networking evidence scenarios", () => {
  it("covers every approved visual module with bounded, semantic steps", () => {
    expect(NETWORK_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      "link-sharing",
      "prefix-decision",
      "neighbor-resolution",
      "encapsulation",
      "routed-delivery",
      "route-repair",
      "internet-reachability",
      "operations",
    ]);

    for (const scenario of NETWORK_SCENARIOS) {
      expect(scenario.steps.length).toBeGreaterThanOrEqual(3);
      expect(scenario.steps.length).toBeLessThanOrEqual(8);
      expect(scenario.steps.every((step) => step.title && step.body && step.insight)).toBe(true);
    }
  });

  it("does not model encapsulation as TCP-only", () => {
    const encapsulation = NETWORK_SCENARIOS.find((scenario) => scenario.id === "encapsulation");
    expect(encapsulation?.steps.some((step) => step.transport === "tcp")).toBe(true);
    expect(encapsulation?.steps.some((step) => step.transport === "udp")).toBe(true);
  });

  it("reconstructs direct scenario and step selection deterministically", () => {
    const initial = createInitialEvidence();
    const routed = selectScenario(initial, "routed-delivery");
    const atRouter = selectEvidenceStep(routed, 4);

    expect(routed.stepIndex).toBe(0);
    expect(atRouter).toEqual(selectEvidenceStep(initial, 4, "routed-delivery"));
    expect(atRouter.activeNodeIds).toContain("router-a");
  });

  it("moves within a scenario and clamps at both boundaries", () => {
    const initial = createInitialEvidence();
    expect(previousEvidence(initial)).toEqual(initial);

    let current = selectScenario(initial, "route-repair");
    for (let index = 0; index < 20; index += 1) current = nextEvidence(current);

    expect(current.stepIndex).toBe(4);
    expect(nextEvidence(current)).toEqual(current);
  });

  it("shows failure before repair and validates the return path", () => {
    const repair = NETWORK_SCENARIOS.find((scenario) => scenario.id === "route-repair");
    expect(repair?.steps.map((step) => step.outcome)).toEqual([
      "observed",
      "dropped",
      "route-added",
      "forwarded",
      "return-verified",
    ]);
  });
});
