import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const networkingEntry = fileURLToPath(new URL("./networking-poc.html", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist/networking-poc",
    emptyOutDir: true,
    rollupOptions: {
      input: networkingEntry,
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
  plugins: [react()],
});
