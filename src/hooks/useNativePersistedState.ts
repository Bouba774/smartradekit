import { useCallback, useEffect, useRef, useState } from 'react';
import { nativeStorage } from '@/lib/nativeStorage';

/**
 * useNativePersistedState
 *
 * State hook backed by nativeStorage (Capacitor Preferences on Android/iOS,
 * localStorage on the web). Perfect for preserving filters, in-progress forms,
 * UI toggles, etc. across navigation, app restarts and device reboots.
 *
 * - Sync first render uses the localStorage mirror (no flash).
 * - Async hydration from native Preferences runs on mount for the very
 *   first launch after install.
 */
export function useNativePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw) as T;
    } catch { /* ignore */ }
    return initial;
  });

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    void nativeStorage.getJSON<T | null>(key, null).then((stored) => {
      if (stored !== null && stored !== undefined) setValue(stored as T);
    });
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      void nativeStorage.setJSON(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, update] as const;
}

export default useNativePersistedState;
