import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import { applyTheme, readTheme } from "./theme";

// Before the first paint, so a dark page does not flash light (step 5.19).
applyTheme(readTheme());

const root = document.getElementById("root");
if (root === null) {
  throw new Error("Element #root fehlt in index.html");
}
// Only a notice for opening without a connection, nothing else on the device (step 5.21,
// ADR-048). Not in development, where the dev server would answer for it.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Without the worker the app works as before; only the notice is missing.
    });
  });
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
