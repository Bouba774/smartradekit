import { useState, useEffect, useCallback } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    // Default to true during SSR or if navigator is not available
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  const [wasOffline, setWasOffline] = useState(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger a re-check after coming back online
        checkConnection();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, checkConnection]);

  return {
    isOnline,
    wasOffline,
    checkConnection,
  };
};

export default useNetworkStatus;
