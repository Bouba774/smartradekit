/**
 * Native Storage layer.
 *
 * - On native (Capacitor) platforms, persists via @capacitor/preferences
 *   (backed by Android SharedPreferences / iOS UserDefaults), which survives
 *   app updates, force-close, WebView cache clears, and device reboots.
 * - On the web, falls back to localStorage.
 * - Mirrors writes to localStorage so existing sync getters keep working,
 *   while the durable native store is the source of truth on Android/iOS.
 * - Auto-migrates known critical keys from legacy localStorage to Preferences
 *   on first launch.
 */
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = (): boolean => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
};

/** Keys that must persist across uninstall/update/reboot. */
export const CRITICAL_KEYS = [
  'smart-trade-tracker-settings',     // vibration / sounds / fontSize / capital / currency
  'pipskit-active-account',           // active account id
  'pipskit-favorites',                 // favorite assets
  'pipskit-calculator-prefs',         // calculator preferences
  'pipskit-pip-mode',                 // pips vs price mode
  'pipskit-tradehub-prefs',           // TradeHub preferences
  'pipskit-commission-per-lot',
  'pipskit-currency',
  'pipskit-user-profile',
  // Legacy keys we still want to preserve:
  'active-account-id',
  'favorite-assets',
  'calculator-prefs',
];

const safeLocalGet = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const safeLocalSet = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* ignore quota */ }
};
const safeLocalRemove = (k: string) => {
  try { localStorage.removeItem(k); } catch { /* ignore */ }
};

export const nativeStorage = {
  async get(key: string): Promise<string | null> {
    if (isNative()) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null && value !== undefined) {
          // Keep localStorage mirror warm for sync consumers.
          safeLocalSet(key, value);
          return value;
        }
      } catch { /* fall through */ }
    }
    return safeLocalGet(key);
  },

  async set(key: string, value: string): Promise<void> {
    // Validate basic shape to avoid storing corrupt blobs.
    if (typeof value !== 'string') {
      try { value = JSON.stringify(value); } catch { return; }
    }
    safeLocalSet(key, value);
    if (isNative()) {
      try { await Preferences.set({ key, value }); } catch { /* ignore */ }
    }
  },

  async remove(key: string): Promise<void> {
    safeLocalRemove(key);
    if (isNative()) {
      try { await Preferences.remove({ key }); } catch { /* ignore */ }
    }
  },

  async getJSON<T = unknown>(key: string, fallback: T): Promise<T> {
    const raw = await this.get(key);
    if (raw == null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  },

  async setJSON(key: string, value: unknown): Promise<void> {
    try { await this.set(key, JSON.stringify(value)); } catch { /* ignore */ }
  },

  /** Migrate any localStorage values for critical keys into Preferences on first launch. */
  async migrate(): Promise<void> {
    if (!isNative()) return;
    for (const key of CRITICAL_KEYS) {
      try {
        const native = await Preferences.get({ key });
        if (native.value) continue; // already in native store
        const local = safeLocalGet(key);
        if (local !== null) {
          await Preferences.set({ key, value: local });
        }
      } catch { /* ignore individual key errors */ }
    }
  },

  /** Bulk hydrate the localStorage mirror from Preferences on app start. */
  async hydrate(): Promise<void> {
    if (!isNative()) return;
    for (const key of CRITICAL_KEYS) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null && value !== undefined) safeLocalSet(key, value);
      } catch { /* ignore */ }
    }
  },
};

export default nativeStorage;
