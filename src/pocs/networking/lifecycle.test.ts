import { describe, expect, it } from "vitest";
import { drawingBufferPlan, rendererShouldRun, resolveReducedMotion } from "./lifecycle";

describe("networking observatory lifecycle", () => {
  it("lets either the platform or the reader reduce motion", () => {
    expect(resolveReducedMotion(false, false)).toBe(false);
    expect(resolveReducedMotion(true, false)).toBe(true);
    expect(resolveReducedMotion(false, true)).toBe(true);
  });

  it("never lets a local preference override a platform reduce-motion request", () => {
    expect(resolveReducedMotion(true, false)).toBe(true);
  });

  it("runs only when initialized, visible, onscreen, and not reduced", () => {
    expect(rendererShouldRun({ initialized: true, pageVisible: true, inView: true, reducedMotion: false })).toBe(true);
    expect(rendererShouldRun({ initialized: false, pageVisible: true, inView: true, reducedMotion: false })).toBe(false);
    expect(rendererShouldRun({ initialized: true, pageVisible: false, inView: true, reducedMotion: false })).toBe(false);
    expect(rendererShouldRun({ initialized: true, pageVisible: true, inView: false, reducedMotion: false })).toBe(false);
    expect(rendererShouldRun({ initialized: true, pageVisible: true, inView: true, reducedMotion: true })).toBe(false);
  });

  it("caps ordinary high-density displays at 1.5 DPR", () => {
    expect(drawingBufferPlan(800, 600, 3)).toEqual({ pixelRatio: 1.5, bufferPixels: 1_080_000 });
  });

  it("reduces DPR further to stay under the drawing-buffer budget", () => {
    const plan = drawingBufferPlan(1600, 1000, 2);

    expect(plan.bufferPixels).toBeLessThanOrEqual(2_100_000);
    expect(plan.pixelRatio).toBeCloseTo(Math.sqrt(2_100_000 / 1_600_000), 5);
  });

  it("guards invalid or zero layout measurements", () => {
    expect(drawingBufferPlan(0, 0, 2)).toEqual({ pixelRatio: 1, bufferPixels: 1 });
  });
});
