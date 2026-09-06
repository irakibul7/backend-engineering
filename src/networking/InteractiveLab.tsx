import { Component, lazy, Suspense, useState, type ReactNode } from "react";
const Lab = lazy(() => import("./NetworkingLab").then((module) => ({ default: module.NetworkingLab })));
class LabBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="status">The interactive lab could not load. All lesson explanations and worked examples remain available below.</p> : this.props.children; }
}
export default function InteractiveLab() {
  const [open, setOpen] = useState(false);
  return <div className="networking-interactive">
    <button className="continue-action" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close interactive lab" : "Explore interactive networking lab"}</button>
    {open ? <LabBoundary><Suspense fallback={<p role="status">Loading networking lab…</p>}><Lab embedded /></Suspense></LabBoundary> : null}
  </div>;
}
