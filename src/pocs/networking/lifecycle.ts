const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_DRAWING_BUFFER_PIXELS = 2_100_000;

export type RendererGate = Readonly<{
  initialized: boolean;
  pageVisible: boolean;
  inView: boolean;
  reducedMotion: boolean;
}>;

export function resolveReducedMotion(systemReduced: boolean, userReduced: boolean): boolean {
  return systemReduced || userReduced;
}

export function rendererShouldRun(gate: RendererGate): boolean {
  return gate.initialized && gate.pageVisible && gate.inView && !gate.reducedMotion;
}

export function drawingBufferPlan(widthInput: number, heightInput: number, devicePixelRatioInput: number) {
  if (!Number.isFinite(widthInput) || widthInput <= 0 || !Number.isFinite(heightInput) || heightInput <= 0) {
    return { pixelRatio: 1, bufferPixels: 1 } as const;
  }
  const width = Number.isFinite(widthInput) && widthInput > 0 ? widthInput : 1;
  const height = Number.isFinite(heightInput) && heightInput > 0 ? heightInput : 1;
  const requestedDpr = Number.isFinite(devicePixelRatioInput) && devicePixelRatioInput > 0 ? devicePixelRatioInput : 1;
  const budgetDpr = Math.sqrt(MAX_DRAWING_BUFFER_PIXELS / (width * height));
  const pixelRatio = Math.min(requestedDpr, MAX_DEVICE_PIXEL_RATIO, budgetDpr);
  const bufferPixels = Math.floor(width * pixelRatio) * Math.floor(height * pixelRatio);

  return { pixelRatio, bufferPixels } as const;
}
