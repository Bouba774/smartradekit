/**
 * Native Haptics layer using Capacitor Haptics on Android/iOS,
 * with navigator.vibrate fallback only on the web.
 *
 * Respects the user "vibration" preference stored in localStorage
 * (key: smart-trade-tracker-settings). Throttled to avoid burst patterns.
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const SETTINGS_STORAGE_KEY = 'smart-trade-tracker-settings';
const MIN_INTERVAL_MS = 40;
let lastAt = 0;

const isNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

const vibrationEnabled = (): boolean => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    return parsed?.vibration !== false;
  } catch {
    return true;
  }
};

const throttle = (): boolean => {
  const now = Date.now();
  if (now - lastAt < MIN_INTERVAL_MS) return false;
  lastAt = now;
  return true;
};

const webFallback = (pattern: number | number[]) => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
};

export type HapticKind = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const nativeHaptics = {
  async impact(style: ImpactStyle = ImpactStyle.Medium, webMs = 50) {
    if (!vibrationEnabled() || !throttle()) return;
    if (isNative()) {
      try { await Haptics.impact({ style }); return; } catch { /* fall through */ }
    }
    webFallback(webMs);
  },

  async notification(type: NotificationType = NotificationType.Success) {
    if (!vibrationEnabled() || !throttle()) return;
    if (isNative()) {
      try { await Haptics.notification({ type }); return; } catch { /* fall through */ }
    }
    const fallback =
      type === NotificationType.Error ? [80, 60, 80] :
      type === NotificationType.Warning ? [60, 40, 60] :
      [40, 30, 80];
    webFallback(fallback);
  },

  async selection() {
    if (!vibrationEnabled() || !throttle()) return;
    if (isNative()) {
      try { await Haptics.selectionStart(); await Haptics.selectionEnd(); return; } catch { /* fall through */ }
    }
    webFallback(15);
  },

  async trigger(kind: HapticKind) {
    switch (kind) {
      case 'selection': return this.selection();
      case 'light': return this.impact(ImpactStyle.Light, 30);
      case 'medium': return this.impact(ImpactStyle.Medium, 60);
      case 'heavy': return this.impact(ImpactStyle.Heavy, 90);
      case 'success': return this.notification(NotificationType.Success);
      case 'warning': return this.notification(NotificationType.Warning);
      case 'error': return this.notification(NotificationType.Error);
    }
  },

  // Semantic shortcuts aligned with the product spec.
  async validate()   { return this.impact(ImpactStyle.Medium, 80); }, // ~80ms form validation
  async delete_()    { return this.impact(ImpactStyle.Heavy, 120); }, // pronounced delete
  async success()    { return this.notification(NotificationType.Success); },
  async error()      { return this.notification(NotificationType.Error); },
  async click()      { return this.impact(ImpactStyle.Light, 30); },
};

export default nativeHaptics;
