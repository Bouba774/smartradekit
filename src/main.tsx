import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error fallback to avoid Android WebView blank screen
window.addEventListener("error", (e) => {
  console.log("JS ERROR:", e.message, e.error);
});
window.addEventListener("unhandledrejection", (e) => {
  console.log("UNHANDLED PROMISE:", e.reason);
});

const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err) {
    console.log("RENDER ERROR:", err);
    rootEl.innerHTML =
      '<div style="color:#fff;background:#0a1929;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:sans-serif;">Erreur de chargement - vérifiez votre connexion</div>';
  }
}
