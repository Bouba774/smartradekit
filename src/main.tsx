import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("error", (e) => {
  console.log("JS ERROR:", e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.log("PROMISE ERROR:", e.reason);
});

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}