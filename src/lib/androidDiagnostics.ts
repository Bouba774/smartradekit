type DiagnosticLevel = "info" | "warn" | "error";

const prefix = "[PipsKit Android]";

export const isNativeAndroidRuntime = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.includes("PipsKit/Native") || ua.includes("Capacitor") || window.location.hostname === "localhost";
};

export const logAndroidStep = (step: string, details?: unknown, level: DiagnosticLevel = "info") => {
  const message = `${prefix} ${step}`;
  if (level === "error") {
    console.error(message, details ?? "");
    return;
  }
  if (level === "warn") {
    console.warn(message, details ?? "");
    return;
  }
  console.log(message, details ?? "");
};

export const markAppReady = (reason: string) => {
  logAndroidStep("App Ready", reason);
  window.dispatchEvent(new Event("app-ready"));
};

export const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};