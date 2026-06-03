import { useCallback } from 'react';
import nativeHaptics from '@/lib/nativeHaptics';

const SETTINGS_STORAGE_KEY = 'smart-trade-tracker-settings';

interface AppSettings {
  vibration: boolean;
  sounds: boolean;
  animations: boolean;
  fontSize: 'small' | 'standard' | 'large';
  background: 'default' | 'gradient' | 'dark' | 'light';
}

const defaultSettings: AppSettings = {
  vibration: true,
  sounds: true,
  animations: true,
  fontSize: 'standard',
  background: 'default',
};

const getSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return defaultSettings;
};

// Pre-load audio files
const clickSound = new Audio('/sounds/click.mp3');
const successSound = new Audio('/sounds/success.mp3');
const errorSound = new Audio('/sounds/error.mp3');

clickSound.volume = 0.3;
successSound.volume = 0.4;
errorSound.volume = 0.4;

export type FeedbackKind = 'click' | 'success' | 'error' | 'validate' | 'delete' | 'warning' | 'selection';

export const useFeedback = () => {
  // Direct native haptic (replaces old navigator.vibrate-only approach).
  const vibrate = useCallback((kind: FeedbackKind = 'click') => {
    switch (kind) {
      case 'success':   void nativeHaptics.success(); break;
      case 'error':     void nativeHaptics.error(); break;
      case 'validate':  void nativeHaptics.validate(); break;
      case 'delete':    void nativeHaptics.delete_(); break;
      case 'warning':   void nativeHaptics.trigger('warning'); break;
      case 'selection': void nativeHaptics.selection(); break;
      default:          void nativeHaptics.click();
    }
  }, []);

  const playSound = useCallback((type: 'click' | 'success' | 'error' = 'click') => {
    const settings = getSettings();
    if (!settings.sounds) return;
    try {
      let audio: HTMLAudioElement;
      switch (type) {
        case 'success':
          audio = successSound.cloneNode() as HTMLAudioElement;
          audio.volume = 0.4;
          break;
        case 'error':
          audio = errorSound.cloneNode() as HTMLAudioElement;
          audio.volume = 0.4;
          break;
        default:
          audio = clickSound.cloneNode() as HTMLAudioElement;
          audio.volume = 0.3;
      }
      audio.play().catch(() => { /* silently fail */ });
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, []);

  const triggerFeedback = useCallback((type: FeedbackKind = 'click') => {
    vibrate(type);
    if (type === 'success' || type === 'error' || type === 'click') {
      playSound(type);
    }
  }, [vibrate, playSound]);

  return {
    vibrate,
    playSound,
    triggerFeedback,
  };
};

export default useFeedback;
