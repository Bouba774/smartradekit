import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logAndroidStep, markAppReady } from "./lib/androidDiagnostics";
import { nativeStorage } from "./lib/nativeStorage";

// Hydrate the localStorage mirror from Capacitor Preferences (native only),
// then migrate any legacy localStorage values into the durable native store.
// Fire-and-forget: it must NEVER block the first paint.
void (async () => {
  try {
    await nativeStorage.hydrate();
    await nativeStorage.migrate();
    logAndroidStep("Native storage ready");
  } catch (e) {
    logAndroidStep("Native storage init failed", e, "warn");
  }
})();

// Global error fallback to avoid Android WebView blank screen
window.addEventListener("error", (e) => {
  logAndroidStep("JavaScript Error", { message: e.message, file: e.filename, line: e.lineno, error: e.error }, "error");
  markAppReady("global-error");
});
window.addEventListener("unhandledrejection", (e) => {
  logAndroidStep("Unhandled Promise", e.reason, "error");
  e.preventDefault();
});

logAndroidStep("App Start", {
  href: window.location.href,
  userAgent: navigator.userAgent,
  online: navigator.onLine,
});

setTimeout(() => {
  const root = document.getElementById("root");
  if (root && root.childElementCount === 0) {
    logAndroidStep("Root still empty after startup timeout", undefined, "warn");
    root.innerHTML =
      '<div style="color:#fff;background:#0a1929;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:Inter,system-ui,sans-serif;"><div><img src="./assets/app-logo.png" alt="PipsKit" style="width:88px;height:88px;object-fit:contain;margin:0 auto 18px;display:block;"><h1 style="font-size:22px;margin:0 0 10px;">PipsKit</h1><p style="color:rgba(255,255,255,.72);margin:0 0 18px;">Erreur de chargement - vérifiez votre connexion</p><button onclick="window.location.reload()" style="border:0;border-radius:10px;background:#00d9ff;color:#03131d;padding:12px 18px;font-weight:700;">Recharger</button></div></div>';
    markAppReady("root-timeout-fallback");
  }
}, 9000);

const rootEl = document.getElementById("root");
if (rootEl) {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err) {
    logAndroidStep("Render Error", err, "error");
    rootEl.innerHTML =
      '<div style="color:#fff;background:#0a1929;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:sans-serif;">Erreur de chargement - vérifiez votre connexion</div>';
    markAppReady("render-catch-fallback");
  }
}
