import {
  Binary,
  Cable,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Globe2,
  Layers3,
  Moon,
  Network,
  Pause,
  Play,
  RadioTower,
  Route,
  Search,
  Sun,
  Terminal,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { rendererShouldRun, resolveReducedMotion } from "./lifecycle";
import {
  NETWORK_SCENARIOS,
  createInitialEvidence,
  evidenceScenario,
  evidenceStep,
  nextEvidence,
  previousEvidence,
  selectEvidenceStep,
  selectScenario,
  type EvidenceState,
  type NetworkScenario,
  type NetworkScenarioId,
} from "./scenarios";
import type { ObservatoryController, ObservatoryMetrics, ObservatoryView } from "./observatory";

type VisualMode = "auto" | "fallback";
type SceneStatus = "waiting" | "loading" | "ready" | "fallback" | "context-lost";

const MOTION_STORAGE_KEY = "backend-engineering:networking-motion:v1";
const EMPTY_METRICS: ObservatoryMetrics = { objects: 0, triangles: 0, pixelRatio: 1, bufferPixels: 0 };

const SCENARIO_ICONS: Record<NetworkScenarioId, LucideIcon> = {
  "link-sharing": Cable,
  "prefix-decision": Binary,
  "neighbor-resolution": RadioTower,
  encapsulation: Layers3,
  "routed-delivery": Waypoints,
  "route-repair": Route,
  "internet-reachability": Globe2,
  operations: Terminal,
};

const ROUTE_REPAIR_ROWS = [
  { destination: "192.0.2.0/24", nextHop: "link", interfaceName: "eth0", source: "connected" },
  { destination: "198.51.100.0/24", nextHop: "192.0.2.20", interfaceName: "eth0", source: "static" },
  { destination: "0.0.0.0/0", nextHop: "192.0.2.1", interfaceName: "eth0", source: "default" },
] as const;

const LAYER_ROWS = [
  { label: "Application data", detail: "Request bytes" },
  { label: "TCP or UDP", detail: "Transport choice" },
  { label: "IPv4 packet", detail: "Source · destination · TTL" },
  { label: "Ethernet frame", detail: "One-link MAC delivery" },
  { label: "Physical signal", detail: "Cable · radio · fiber" },
] as const;

function readUserReducedMotion(): boolean {
  try {
    const raw = window.localStorage.getItem(MOTION_STORAGE_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && "version" in parsed && "reduceMotion" in parsed
      && parsed.version === 1 && parsed.reduceMotion === true;
  } catch {
    return false;
  }
}

function writeUserReducedMotion(value: boolean) {
  try {
    if (value) window.localStorage.setItem(MOTION_STORAGE_KEY, JSON.stringify({ version: 1, reduceMotion: true }));
    else window.localStorage.removeItem(MOTION_STORAGE_KEY);
  } catch {
    // The preference is optional; private mode and quota failures must not break reading.
  }
}

function Header({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  const ThemeIcon = dark ? Moon : Sun;
  return (
    <header className="poc-header">
      <a className="poc-brand" href="/" aria-label="Backend Engineering home">
        <img src="/icon-192.png?v=2" width="44" height="44" alt="" />
      </a>
      <nav aria-label="Primary navigation">
        <a href="/">Library</a>
        <a href="/roadmap/">Roadmap</a>
        <span>Notes</span>
      </nav>
      <div className="poc-search" aria-hidden="true"><Search size={18} /><span>Search topics, chapters, notes…</span><kbd>⌘ K</kbd></div>
      <button type="button" className="icon-button" onClick={onToggleTheme} aria-label="Switch color theme"><ThemeIcon size={18} /></button>
      <a className="profile-link" href="https://therakibul.me" aria-label="Visit Rakibul Islam's portfolio">RI</a>
    </header>
  );
}

function ScenarioNavigation({ state, onSelect }: { state: EvidenceState; onSelect: (id: NetworkScenarioId) => void }) {
  return (
    <nav className="scenario-navigation" aria-label="Networking evidence modules">
      {NETWORK_SCENARIOS.map((scenario) => {
        const Icon = SCENARIO_ICONS[scenario.id];
        const selected = state.scenarioId === scenario.id;
        return (
          <button
            type="button"
            key={scenario.id}
            className={selected ? "is-selected" : ""}
            aria-current={selected ? "page" : undefined}
            onClick={() => onSelect(scenario.id)}
          >
            <Icon size={18} aria-hidden="true" />
            <span><small>{scenario.number}</small>{scenario.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function RouteRepairEvidence({ stepIndex }: { stepIndex: number }) {
  const routeAdded = stepIndex >= 2;
  const selectedIndex = routeAdded ? 1 : 2;
  return (
    <div className="route-table-wrap" tabIndex={0} aria-label="Scrollable route-repair table">
      <table>
        <thead><tr><th>Destination</th><th>Next hop</th><th>Interface</th><th>Source</th></tr></thead>
        <tbody>
          {ROUTE_REPAIR_ROWS.map((row, index) => {
            if (index === 1 && !routeAdded) return null;
            return (
              <tr key={row.destination} className={index === selectedIndex ? "is-selected" : ""}>
                <td>{index === selectedIndex ? <span className="visually-hidden">Selected route: </span> : null}{row.destination}</td>
                <td>{row.nextHop}</td><td>{row.interfaceName}</td><td>{row.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LayerEvidence({ stepIndex }: { stepIndex: number }) {
  const activeLayer = stepIndex === 0 ? 0 : stepIndex <= 2 ? 1 : stepIndex === 3 ? 2 : 3;
  return (
    <ol className="semantic-layer-stack" aria-label="Protocol layers">
      {LAYER_ROWS.map((layer, index) => (
        <li key={layer.label} className={index === activeLayer ? "is-active" : index < activeLayer ? "is-complete" : ""}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><strong>{layer.label}</strong><small>{layer.detail}</small></div>
        </li>
      ))}
    </ol>
  );
}

function PrefixEvidence({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="prefix-workbench" aria-label="IPv4 prefix workbench">
      <div className="prefix-address"><span>{stepIndex >= 2 ? "203" : "192"}</span><span>{stepIndex >= 2 ? "0" : "0"}</span><span>{stepIndex >= 2 ? "113" : "2"}</span><span>{stepIndex >= 2 ? "42" : "10"}</span><strong>/24</strong></div>
      <div className="prefix-bands" aria-hidden="true"><span>NETWORK · 24 BITS</span><span>HOST · 8 BITS</span></div>
      <dl>
        <div><dt>Mask</dt><dd>255.255.255.0</dd></div>
        <div><dt>Result</dt><dd>{stepIndex >= 2 ? "203.0.113.0" : "192.0.2.0"}</dd></div>
        <div><dt>Decision</dt><dd>{stepIndex < 2 ? "Local link" : stepIndex === 2 ? "Remote network" : "Use 192.0.2.1"}</dd></div>
      </dl>
    </div>
  );
}

function InternetEvidence({ stepIndex }: { stepIndex: number }) {
  const stages = ["Client route", "ISP interior", "BGP boundary", "Destination AS"];
  return (
    <ol className="reachability-timeline" aria-label="Internet reachability stages">
      {stages.map((label, index) => (
        <li key={label} className={index <= stepIndex ? "is-active" : ""}>
          <span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>
          <small>{index === 0 ? "Configured next hop" : index === 1 ? "OSPF-installed route" : index === 2 ? "BGP-learned prefix" : "Local forwarding"}</small>
        </li>
      ))}
    </ol>
  );
}

function OperationsEvidence({ stepIndex }: { stepIndex: number }) {
  const rows = [
    ["Interface and address", "ip link · ip address"],
    ["Adjacent next hop", "ip neigh"],
    ["Selected route", "ip route get 203.0.113.42"],
    ["Path and application", "traceroute · ss · curl · capture"],
  ] as const;
  return (
    <ol className="command-matrix" aria-label="Networking command matrix">
      {rows.map(([question, command], index) => (
        <li key={question} className={index === stepIndex ? "is-active" : ""}>
          <span>{String(index + 1).padStart(2, "0")}</span><strong>{question}</strong><code>{command}</code>
        </li>
      ))}
    </ol>
  );
}

function ScenarioEvidence({ scenario, state }: { scenario: NetworkScenario; state: EvidenceState }) {
  const current = evidenceStep(state);
  return (
    <aside className="evidence-panel" aria-labelledby="evidence-panel-title" data-testid="semantic-evidence">
      <header>
        <span className="route-icon" aria-hidden="true"><Network size={20} /></span>
        <div><h2 id="evidence-panel-title">Live evidence</h2><p>{scenario.label} · Step {state.stepIndex + 1}</p></div>
      </header>
      {scenario.visual === "prefix" ? <PrefixEvidence stepIndex={state.stepIndex} /> : null}
      {scenario.visual === "layers" ? <LayerEvidence stepIndex={state.stepIndex} /> : null}
      {scenario.visual === "routes" ? <RouteRepairEvidence stepIndex={state.stepIndex} /> : null}
      {scenario.visual === "internet" ? <InternetEvidence stepIndex={state.stepIndex} /> : null}
      {scenario.visual === "operations" ? <OperationsEvidence stepIndex={state.stepIndex} /> : null}
      <dl className="evidence-facts">
        {current.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>
      <div className="evidence-insight"><CircleCheck size={21} aria-hidden="true" /><div><strong>What to notice</strong><p>{current.insight}</p></div></div>
    </aside>
  );
}

function SemanticFallback({ scenario, state }: { scenario: NetworkScenario; state: EvidenceState }) {
  const current = evidenceStep(state);
  return (
    <div className="semantic-fallback" data-testid="semantic-fallback">
      <span>Semantic view active</span>
      <strong>{scenario.eyebrow}</strong>
      <p>{current.body}</p>
      <dl>{current.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
    </div>
  );
}

function observatoryView(scenario: NetworkScenario, state: EvidenceState): ObservatoryView {
  return { mode: scenario.visual, stepIndex: state.stepIndex, activeNodeIds: state.activeNodeIds, activeLinkIds: state.activeLinkIds };
}

export function NetworkingPoc({ visualMode = "auto" }: { visualMode?: VisualMode }) {
  const intersectionObserverAvailable = typeof window.IntersectionObserver === "function";
  const [state, setState] = useState(createInitialEvidence);
  const [announcement, setAnnouncement] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [dark, setDark] = useState(false);
  const [userReduced, setUserReduced] = useState(readUserReducedMotion);
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  const [inView, setInView] = useState(!intersectionObserverAvailable);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [sceneRequested, setSceneRequested] = useState(visualMode === "auto" && !intersectionObserverAvailable);
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>(visualMode === "fallback" ? "fallback" : "waiting");
  const [metrics, setMetrics] = useState<ObservatoryMetrics>(EMPTY_METRICS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ObservatoryController | null>(null);
  const reduceMotion = resolveReducedMotion(systemReduced, userReduced);
  const scenario = evidenceScenario(state);
  const current = evidenceStep(state);
  const effectivePlaying = isPlaying && !reduceMotion && state.stepIndex < scenario.steps.length - 1;

  const commitState = useCallback((next: EvidenceState, announce = true) => {
    setState(next);
    if (announce) setAnnouncement(`${evidenceScenario(next).label}, step ${next.stepIndex + 1}: ${evidenceStep(next).title}`);
  }, []);

  const goToScenario = useCallback((id: NetworkScenarioId) => {
    setIsPlaying(false);
    setState((currentState) => {
      const next = selectScenario(currentState, id);
      setAnnouncement(`${evidenceScenario(next).label}: ${evidenceStep(next).title}`);
      return next;
    });
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setIsPlaying(false);
    setState((currentState) => {
      const next = selectEvidenceStep(currentState, stepIndex);
      setAnnouncement(`${evidenceScenario(next).label}, step ${next.stepIndex + 1}: ${evidenceStep(next).title}`);
      return next;
    });
  }, []);

  const goPrevious = useCallback(() => {
    setIsPlaying(false);
    setState((currentState) => {
      const next = previousEvidence(currentState);
      setAnnouncement(`${evidenceScenario(next).label}, step ${next.stepIndex + 1}: ${evidenceStep(next).title}`);
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    setIsPlaying(false);
    setState((currentState) => {
      const next = nextEvidence(currentState);
      setAnnouncement(`${evidenceScenario(next).label}, step ${next.stepIndex + 1}: ${evidenceStep(next).title}`);
      return next;
    });
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setSystemReduced(query.matches); if (query.matches) setIsPlaying(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const host = sceneHostRef.current;
    if (!host || visualMode === "fallback" || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setSceneRequested(true);
    }, { rootMargin: "180px", threshold: 0.08 });
    observer.observe(host);
    return () => observer.disconnect();
  }, [visualMode]);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!sceneRequested || visualMode === "fallback") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    setSceneStatus("loading");
    import("./observatory")
      .then(({ createObservatory }) => {
        if (cancelled) return;
        const initialState = createInitialEvidence();
        const controller = createObservatory({
          canvas,
          initialView: observatoryView(evidenceScenario(initialState), initialState),
          onContextLost: () => setSceneStatus("context-lost"),
          onContextRestored: () => setSceneStatus("ready"),
          onMetrics: setMetrics,
        });
        if (cancelled) { controller.dispose(); return; }
        controllerRef.current = controller;
        setSceneStatus("ready");
      })
      .catch(() => { if (!cancelled) setSceneStatus("fallback"); });
    return () => {
      cancelled = true;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [sceneRequested, visualMode]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    const enabled = rendererShouldRun({ initialized: true, pageVisible, inView, reducedMotion: reduceMotion });
    controller.setEnabled(enabled);
    controller.setView(observatoryView(scenario, state), enabled);
  }, [inView, pageVisible, reduceMotion, scenario, sceneStatus, state]);

  useEffect(() => {
    if (!effectivePlaying) return;
    const timer = window.setTimeout(() => {
      const next = nextEvidence(state);
      commitState(next);
      if (next.stepIndex >= evidenceScenario(next).steps.length - 1) setIsPlaying(false);
    }, 1_150);
    return () => window.clearTimeout(timer);
  }, [commitState, effectivePlaying, state]);

  function togglePlayback() {
    if (reduceMotion) return;
    if (!effectivePlaying && state.stepIndex === scenario.steps.length - 1) commitState(selectEvidenceStep(state, 0));
    setIsPlaying((currentPlaying) => !currentPlaying);
  }

  function toggleMotion() {
    if (systemReduced) return;
    setUserReduced((currentReduced) => {
      const next = !currentReduced;
      writeUserReducedMotion(next);
      if (next) setIsPlaying(false);
      return next;
    });
  }

  function handleStepKeys(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goToStep(state.stepIndex + (event.key === "ArrowRight" ? 1 : -1));
  }

  function testContextRecovery() {
    const started = controllerRef.current?.simulateContextLoss() ?? false;
    setAnnouncement(started ? "Testing WebGL context recovery." : "Context-loss testing is unavailable in this browser.");
  }

  const rendering = rendererShouldRun({ initialized: sceneStatus === "ready", pageVisible, inView, reducedMotion: reduceMotion });

  return (
    <>
      <a className="skip-link" href="#poc-main">Skip to networking proof</a>
      <Header dark={dark} onToggleTheme={() => setDark((currentDark) => !currentDark)} />
      <div className="poc-shell">
        <aside className="chapter-rail" aria-label="Chapter outline">
          <a className="back-library" href="/"><ChevronLeft size={16} />Library</a>
          <div className="chapter-identity"><span>Chapter 07 · Expanded proof</span><h2>Networking and Packet Routing</h2><p>8 modules · 40 states</p></div>
          <ol className="coverage-list">
            {NETWORK_SCENARIOS.map((item) => <li key={item.id} className={item.id === scenario.id ? "is-active" : ""}><span>{item.number}</span>{item.label}</li>)}
          </ol>
        </aside>

        <main id="poc-main" className="poc-main">
          <ScenarioNavigation state={state} onSelect={goToScenario} />
          <header className="lesson-heading">
            <p>{scenario.number} / {scenario.eyebrow} / {state.stepIndex + 1} of {scenario.steps.length}</p>
            <h1>{current.title}</h1>
            <div className="lesson-summary">
              <p id="current-explanation">{current.body}</p>
              <button type="button" className="motion-toggle" onClick={toggleMotion} aria-pressed={reduceMotion} disabled={systemReduced}>Reduce motion <span>{reduceMotion ? "On" : "Off"}</span></button>
            </div>
          </header>

          <section className="observatory-grid" aria-labelledby="observatory-title">
            <h2 id="observatory-title" className="visually-hidden">Interactive networking evidence</h2>
            <div className="observatory-stage evidence-stage" ref={sceneHostRef} onFocusCapture={() => setSceneRequested(true)} data-scene-status={sceneStatus} data-rendering={rendering ? "active" : "idle"} data-visual={scenario.visual}>
              <div className="scene-caption"><span>{scenario.number}</span><div><strong>{scenario.label}</strong><small>{scenario.summary}</small></div></div>
              <div className="canvas-region">
                <canvas ref={canvasRef} role="img" aria-label={`3D networking evidence for ${scenario.label}, step ${state.stepIndex + 1}: ${current.short}`} aria-describedby="current-explanation" />
                {sceneStatus === "waiting" || sceneStatus === "loading" ? <div className="scene-loading" aria-hidden="true">Preparing 3D evidence…</div> : null}
                {sceneStatus === "fallback" || sceneStatus === "context-lost" ? <SemanticFallback scenario={scenario} state={state} /> : null}
              </div>
            </div>
            <ScenarioEvidence scenario={scenario} state={state} />
          </section>

          <div className="journey-select-wrap">
            <label htmlFor="journey-step">{scenario.label} step</label>
            <select id="journey-step" value={state.stepIndex} onChange={(event) => goToStep(Number(event.target.value))}>
              {scenario.steps.map((item, index) => <option key={item.short} value={index}>{index + 1}. {item.short}</option>)}
            </select>
          </div>
          <div className="journey-rail" role="group" aria-label="Evidence steps" onKeyDown={handleStepKeys} style={{ "--step-count": scenario.steps.length } as CSSProperties}>
            {scenario.steps.map((item, index) => (
              <button key={item.short} type="button" onClick={() => goToStep(index)} aria-current={index === state.stepIndex ? "step" : undefined}>
                <span>{String(index + 1).padStart(2, "0")}</span><small>{item.short}</small>
              </button>
            ))}
          </div>
          <div className="journey-controls">
            <button type="button" onClick={goPrevious} disabled={state.stepIndex === 0}><ChevronLeft size={18} />Back</button>
            <button type="button" onClick={togglePlayback} disabled={reduceMotion} aria-pressed={effectivePlaying}>{effectivePlaying ? <Pause size={18} /> : <Play size={18} />}{effectivePlaying ? "Pause" : "Auto-play"}</button>
            <button type="button" className="primary-control" onClick={goNext} disabled={state.stepIndex === scenario.steps.length - 1}>Continue<ChevronRight size={18} /></button>
          </div>
          <p className="control-hint">Choose a module, then use the controls or focus the step rail and press ← →.</p>
          <details className="poc-metrics proof-metrics">
            <summary>3D proof boundaries</summary>
            <dl>
              <div><dt>Objects</dt><dd>{metrics.objects || "Not loaded"}</dd></div><div><dt>Triangles</dt><dd>{metrics.triangles || "Not loaded"}</dd></div>
              <div><dt>Pixel ratio</dt><dd>{metrics.pixelRatio.toFixed(2)}</dd></div><div><dt>Buffer pixels</dt><dd>{metrics.bufferPixels.toLocaleString()}</dd></div>
            </dl>
            <button type="button" onClick={testContextRecovery} disabled={sceneStatus !== "ready"}>Test context recovery</button>
          </details>
          <p className="visually-hidden" aria-live="polite">{announcement}</p>
        </main>
      </div>
    </>
  );
}
