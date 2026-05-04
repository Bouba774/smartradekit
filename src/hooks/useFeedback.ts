import { useCallback } from 'react';

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

// Set volume
clickSound.volume = 0.3;
successSound.volume = 0.4;
errorSound.volume = 0.4;

const HAPTIC_DURATION_MS = 70;
let lastHapticAt = 0;

export const useFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = HAPTIC_DURATION_MS) => {
    const settings = getSettings();
    if (!settings.vibration || !navigator.vibrate) return;
    const now = Date.now();
    if (now - lastHapticAt < 40) return;
    lastHapticAt = now;
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }, []);

  const playSound = useCallback((type: 'click' | 'success' | 'error' = 'click') => {
    const settings = getSettings();
    if (settings.sounds) {
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
        audio.play().catch(() => {
          // Silently fail if audio can't play
        });
      } catch (e) {
        console.warn('Audio playback failed:', e);
      }
    }
  }, []);

  const triggerFeedback = useCallback((type: 'click' | 'success' | 'error' = 'click') => {
    const settings = getSettings();
    
    // Vibration patterns
    const vibrationPatterns = {
      click: HAPTIC_DURATION_MS,
      success: [HAPTIC_DURATION_MS, 50, 100],
      error: [100, 50, 100],
    };

    if (settings.vibration && navigator.vibrate) {
      const now = Date.now();
      if (now - lastHapticAt >= 40) {
        lastHapticAt = now;
        try { navigator.vibrate(vibrationPatterns[type]); } catch { /* ignore */ }
      }
    }

    if (settings.sounds) {
      playSound(type);
    }
  }, [playSound]);

  return {
    vibrate,
    playSound,
    triggerFeedback,
  };
};

export default useFeedback;
