import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Prototype } from "./Prototype";
import "./prototype.css";

export function App() {
  const hostname = window.location.hostname;
  const isVercelHosted = hostname === "backend.therakibul.me" || hostname.endsWith(".vercel.app");

  return (
    <>
      <Prototype />
      {isVercelHosted ? <Analytics /> : null}
      {isVercelHosted ? <SpeedInsights /> : null}
    </>
  );
}
