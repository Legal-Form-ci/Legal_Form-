import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/config";
import App from "./App";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { initGA } from "./utils/analytics";

// Initialize Google Analytics
initGA();

// Register Service Worker for offline support
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
