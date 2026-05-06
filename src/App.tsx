import React, { useEffect } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppWrapper from "./AppWrapper"; // ⚠️ on va créer ce composant juste après

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const handleError = (e: any) => {
      console.error("Global error:", e);
    };

    const handleRejection = (e: any) => {
      console.error("Promise error:", e.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  // ✅ FIX CRITIQUE ANDROID
  const isCapacitor =
    typeof window !== "undefined" &&
    (window.location.protocol === "file:" ||
      window.location.protocol === "capacitor:");

  const Router = isCapacitor ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppWrapper />
      </Router>
    </QueryClientProvider>
  );
};

export default App;