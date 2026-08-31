import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/spline-sans/400.css";
import "@fontsource/spline-sans/500.css";
import "@fontsource/spline-sans/600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NetworkingPoc } from "./NetworkingPoc";
import "./networking-poc.css";

const visualMode = new URLSearchParams(window.location.search).get("webgl") === "off" ? "fallback" : "auto";
const root = document.getElementById("networking-poc-root");
if (!root) throw new Error("Networking PoC root is missing");

createRoot(root).render(
  <StrictMode>
    <NetworkingPoc visualMode={visualMode} />
  </StrictMode>,
);
