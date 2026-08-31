import * as THREE from "three";
import { drawingBufferPlan } from "./lifecycle";
import type { EvidenceVisual } from "./scenarios";

export type ObservatoryMetrics = Readonly<{
  objects: number;
  triangles: number;
  pixelRatio: number;
  bufferPixels: number;
}>;

export type ObservatoryView = Readonly<{
  mode: EvidenceVisual;
  stepIndex: number;
  activeNodeIds: readonly string[];
  activeLinkIds: readonly string[];
}>;

export type ObservatoryController = Readonly<{
  setEnabled: (enabled: boolean) => void;
  setView: (view: ObservatoryView, animate: boolean) => void;
  simulateContextLoss: () => boolean;
  dispose: () => void;
}>;

type ObservatoryOptions = Readonly<{
  canvas: HTMLCanvasElement;
  initialView: ObservatoryView;
  onContextLost: () => void;
  onContextRestored: () => void;
  onMetrics: (metrics: ObservatoryMetrics) => void;
}>;

const LAYER_Y = [2.45, 1.2, -0.05, -1.3, -2.55] as const;
const BASE_COLORS = [0xdfe7f4, 0xcbdaf1, 0xf0d1c5, 0xd8cef2, 0xd9e0e7] as const;
const ACTIVE_COLOR = new THREE.Color(0xff5a0a);
const MUTED_NODE_COLOR = new THREE.Color(0x9facbd);
const ACTIVE_NODE_COLOR = new THREE.Color(0xff5a0a);

const NETWORK_POSITIONS = [
  new THREE.Vector3(-3.7, 0, 0.2),
  new THREE.Vector3(-2.5, 1.1, -0.2),
  new THREE.Vector3(-1.25, 0, 0.2),
  new THREE.Vector3(0, 1.1, -0.2),
  new THREE.Vector3(1.25, 0, 0.2),
  new THREE.Vector3(2.5, 1.1, -0.2),
  new THREE.Vector3(3.7, 0, 0.2),
] as const;

function triangleCount(root: THREE.Object3D): number {
  let total = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry;
    if (geometry.index) total += geometry.index.count / 3;
    else total += (geometry.getAttribute("position")?.count ?? 0) / 3;
  });
  return total;
}

function objectCount(root: THREE.Object3D): number {
  let total = 0;
  root.traverse(() => { total += 1; });
  return total;
}

function activeLayer(view: ObservatoryView): number {
  if (view.stepIndex === 0) return 0;
  if (view.stepIndex <= 2) return 1;
  if (view.stepIndex === 3) return 2;
  return 3;
}

function targetNetworkIndex(view: ObservatoryView): number {
  if (view.mode === "routes") return [0, 1, 1, 6, 0][Math.min(view.stepIndex, 4)];
  if (view.mode === "internet") return Math.min(view.stepIndex * 2, 6);
  if (view.mode === "prefix" || view.mode === "operations") return Math.min(view.stepIndex * 2, 6);
  return Math.min(view.stepIndex, 6);
}

export function createObservatory({
  canvas,
  initialView,
  onContextLost,
  onContextRestored,
  onMetrics,
}: ObservatoryOptions): ObservatoryController {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(7.4, 4.6, 9.2);
  camera.lookAt(0, -0.1, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x536175, 2.5);
  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(4, 7, 6);
  scene.add(ambient, key);

  const stack = new THREE.Group();
  stack.rotation.y = -0.08;
  scene.add(stack);

  const plateGeometry = new THREE.BoxGeometry(5.2, 0.18, 2.65);
  const edgeGeometry = new THREE.EdgesGeometry(plateGeometry);
  const plateMaterials: THREE.MeshPhysicalMaterial[] = [];
  const edgeMaterials: THREE.LineBasicMaterial[] = [];

  for (const [index, y] of LAYER_Y.entries()) {
    const material = new THREE.MeshPhysicalMaterial({
      color: BASE_COLORS[index],
      metalness: 0.04,
      roughness: 0.28,
      transparent: true,
      opacity: 0.48,
      transmission: 0.06,
      depthWrite: false,
    });
    const plate = new THREE.Mesh(plateGeometry, material);
    plate.position.set(index % 2 === 0 ? 0.08 : -0.08, y, 0);
    plate.renderOrder = index;
    const edgeMaterial = new THREE.LineBasicMaterial({ color: index === 2 ? 0xef6a32 : 0x73849e, transparent: true, opacity: 0.68 });
    const outline = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    plate.add(outline);
    stack.add(plate);
    plateMaterials.push(material);
    edgeMaterials.push(edgeMaterial);
  }

  const signalPoints = Array.from({ length: 28 }, (_, index) => new THREE.Vector3(-2.15 + index * 0.16, Math.sin(index * 1.7) * 0.12, 0));
  const signalGeometry = new THREE.BufferGeometry().setFromPoints(signalPoints);
  const signalMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
  const signal = new THREE.Line(signalGeometry, signalMaterial);
  signal.position.set(0, LAYER_Y[4] + 0.18, 0);
  stack.add(signal);

  const network = new THREE.Group();
  network.position.y = -0.4;
  scene.add(network);

  const planeGeometry = new THREE.BoxGeometry(2.55, 0.08, 2.65);
  const planeMaterials = [0xe6edf6, 0xffe5d7, 0xe2e8f0].map((color) => new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.34, depthWrite: false, roughness: 0.6 }));
  for (const [index, x] of [-2.7, 0, 2.7].entries()) {
    const plane = new THREE.Mesh(planeGeometry, planeMaterials[index]);
    plane.position.set(x, -0.65, 0);
    network.add(plane);
  }

  const nodeGeometry = new THREE.CylinderGeometry(0.42, 0.48, 0.62, 16);
  const nodeMaterials: THREE.MeshStandardMaterial[] = [];
  for (const [index, position] of NETWORK_POSITIONS.entries()) {
    const material = new THREE.MeshStandardMaterial({ color: index === 0 ? ACTIVE_NODE_COLOR : MUTED_NODE_COLOR, roughness: 0.45, metalness: 0.06 });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(position);
    node.rotation.z = Math.PI / 2;
    network.add(node);
    nodeMaterials.push(material);
  }

  const connectionPoints: THREE.Vector3[] = [];
  for (let index = 0; index < NETWORK_POSITIONS.length - 1; index += 1) {
    connectionPoints.push(NETWORK_POSITIONS[index], NETWORK_POSITIONS[index + 1]);
  }
  const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connectionPoints);
  const connectionMaterial = new THREE.LineBasicMaterial({ color: 0x6f7e91, transparent: true, opacity: 0.58 });
  const connections = new THREE.LineSegments(connectionGeometry, connectionMaterial);
  network.add(connections);

  const payloadGeometry = new THREE.BoxGeometry(0.58, 0.58, 0.58);
  const payloadMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff5a0a, roughness: 0.2, metalness: 0.05 });
  const payload = new THREE.Mesh(payloadGeometry, payloadMaterial);
  scene.add(payload);

  let enabled = true;
  let disposed = false;
  let committedView = initialView;
  let targetPosition = new THREE.Vector3();
  let animationStartedAt = 0;
  const animationStart = new THREE.Vector3();
  const animationDuration = 520;

  function updateMaterials(view: ObservatoryView) {
    const layerIndex = activeLayer(view);
    for (const [index, material] of plateMaterials.entries()) {
      material.color.copy(index === layerIndex ? ACTIVE_COLOR : new THREE.Color(BASE_COLORS[index]));
      material.opacity = index === layerIndex ? 0.78 : 0.42;
      material.emissive.set(index === layerIndex ? 0x3b1200 : 0x000000);
      material.emissiveIntensity = index === layerIndex ? 0.28 : 0;
    }

    const activeCount = Math.max(1, Math.min(view.activeNodeIds.length, nodeMaterials.length));
    const pathIndex = targetNetworkIndex(view);
    for (const [index, material] of nodeMaterials.entries()) {
      const active = index <= pathIndex && index < activeCount;
      material.color.copy(active ? ACTIVE_NODE_COLOR : MUTED_NODE_COLOR);
      material.emissive.set(active ? 0x351100 : 0x000000);
      material.emissiveIntensity = active ? 0.28 : 0;
    }
    connectionMaterial.color.set(view.activeLinkIds.length > 0 ? 0xff5a0a : 0x6f7e91);
    connectionMaterial.opacity = view.activeLinkIds.length > 0 ? 0.76 : 0.42;
  }

  function viewTarget(view: ObservatoryView): THREE.Vector3 {
    if (view.mode === "layers") return new THREE.Vector3(0, LAYER_Y[activeLayer(view)] + 0.48, 0);
    return NETWORK_POSITIONS[targetNetworkIndex(view)].clone().add(new THREE.Vector3(0, 0.62, 0));
  }

  function applyVisibility(view: ObservatoryView) {
    stack.visible = view.mode === "layers";
    network.visible = view.mode !== "layers";
  }

  function render() {
    if (!disposed) renderer.render(scene, camera);
  }

  function stopLoop() {
    renderer.setAnimationLoop(null);
  }

  function applyCommittedState() {
    applyVisibility(committedView);
    updateMaterials(committedView);
    payload.position.copy(targetPosition);
    payload.rotation.set(0, committedView.stepIndex * 0.18, 0);
    render();
  }

  function animateFrame(time: number) {
    if (!enabled || disposed) {
      stopLoop();
      applyCommittedState();
      return;
    }
    const progress = Math.min(1, Math.max(0, time - animationStartedAt) / animationDuration);
    const eased = 1 - Math.pow(1 - progress, 3);
    payload.position.lerpVectors(animationStart, targetPosition, eased);
    payload.rotation.y += 0.025;
    render();
    if (progress >= 1) {
      stopLoop();
      applyCommittedState();
    }
  }

  function setView(view: ObservatoryView, animate: boolean) {
    committedView = view;
    animationStart.copy(payload.position);
    targetPosition = viewTarget(view);
    applyVisibility(view);
    updateMaterials(view);
    if (!animate || !enabled) {
      stopLoop();
      applyCommittedState();
      return;
    }
    animationStartedAt = performance.now();
    renderer.setAnimationLoop(animateFrame);
  }

  function setEnabled(nextEnabled: boolean) {
    enabled = nextEnabled;
    if (!enabled) {
      stopLoop();
      applyCommittedState();
    }
  }

  function resize() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const plan = drawingBufferPlan(width, height, window.devicePixelRatio);
    renderer.setPixelRatio(plan.pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
    onMetrics({ objects: objectCount(scene), triangles: Math.round(triangleCount(scene)), pixelRatio: plan.pixelRatio, bufferPixels: plan.bufferPixels });
  }

  function handleContextLost(event: Event) {
    event.preventDefault();
    stopLoop();
    onContextLost();
  }

  function handleContextRestored() {
    applyCommittedState();
    onContextRestored();
  }

  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(canvas);
  else window.addEventListener("resize", resize);

  targetPosition = viewTarget(initialView);
  applyCommittedState();
  resize();

  return {
    setEnabled,
    setView,
    simulateContextLoss() {
      const extension = renderer.getContext().getExtension("WEBGL_lose_context");
      if (!extension) return false;
      extension.loseContext();
      window.setTimeout(() => extension.restoreContext(), 350);
      return true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stopLoop();
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      plateGeometry.dispose();
      edgeGeometry.dispose();
      signalGeometry.dispose();
      signalMaterial.dispose();
      planeGeometry.dispose();
      for (const material of planeMaterials) material.dispose();
      nodeGeometry.dispose();
      for (const material of nodeMaterials) material.dispose();
      connectionGeometry.dispose();
      connectionMaterial.dispose();
      payloadGeometry.dispose();
      payloadMaterial.dispose();
      for (const material of plateMaterials) material.dispose();
      for (const material of edgeMaterials) material.dispose();
      renderer.dispose();
    },
  };
}
