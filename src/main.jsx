import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const { loadLesson } = await import("./content/loadLesson");
const slug = window.location.pathname.startsWith("/chapters/") ? window.location.pathname.split("/").filter(Boolean).at(-1) : undefined;
// Mount the route error UI even if an initial lesson chunk cannot be fetched.
if (slug) await loadLesson(slug).catch(() => undefined);
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
