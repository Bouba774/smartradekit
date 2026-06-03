/**
 * Native Android bridge helpers.
 *
 * The native APK exposes `window.AndroidBridge` (see PipsKitJsBridge.kt).
 * Web code should prefer the bridge when present and fall back to Web APIs otherwise.
 *
 * Priority: Android native > Capacitor > Web.
 */

export interface AndroidBridge {
  isNativeAndroid(): boolean;
  hasMediaPermissions(): boolean;
  requestMediaPermissions(): void;
  setModalOpen(open: boolean): void;
  sharePdfBase64(base64: string, filename: string): void;
}

declare global {
  interface Window {
    AndroidBridge?: AndroidBridge;
  }
}

export const getAndroidBridge = (): AndroidBridge | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.AndroidBridge && typeof window.AndroidBridge.isNativeAndroid === 'function'
      ? window.AndroidBridge
      : null;
  } catch {
    return null;
  }
};

export const isNativeAndroid = (): boolean => !!getAndroidBridge();

/** Notify native layer that a modal/sheet is open so the hardware back closes it. */
export const setNativeModalOpen = (open: boolean): void => {
  try {
    getAndroidBridge()?.setModalOpen(open);
  } catch {
    /* no-op */
  }
};

/** Listen for the hardware back button while a modal is open. */
export const onAndroidBack = (handler: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener('android-back', listener);
  return () => window.removeEventListener('android-back', listener);
};

/**
 * Convert a Blob to raw base64 (no data: prefix).
 */
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Share or save a generated PDF.
 * - Native Android: routes through the OS share sheet (WhatsApp, Telegram, Gmail, Drive, Bluetooth…).
 * - Web: falls back to Web Share API when available, otherwise triggers a download.
 */
export const sharePdf = async (blob: Blob, filename: string): Promise<void> => {
  const bridge = getAndroidBridge();
  if (bridge) {
    const base64 = await blobToBase64(blob);
    bridge.sharePdfBase64(base64, filename);
    return;
  }

  // Web fallback – try Web Share API with file support
  const file = new File([blob], filename, { type: 'application/pdf' });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files: File[]; title?: string }) => Promise<void>;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: 'PipsKit – Rapport' });
      return;
    } catch {
      /* fall through to download */
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
