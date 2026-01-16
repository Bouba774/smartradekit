import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Session storage key for unlock state - clears when tab closes
const UNLOCK_SESSION_KEY = 'app_unlocked_session';
const LOCK_COOLDOWN_KEY = 'pin_lock_cooldown';
const FAILED_ATTEMPTS_KEY = 'pin_failed_attempts';

interface SecuritySettings {
  confidentialMode: boolean;
}

interface SecurityContextType {
  settings: SecuritySettings;
  isLoading: boolean;
  toggleConfidentialMode: () => Promise<void>;
  updateSettings: (updates: Partial<SecuritySettings>) => Promise<void>;
  // Lock state management
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  lastActiveTime: number;
  updateLastActiveTime: () => void;
  // PIN security state
  isPinConfigured: boolean;
  autoLockTimeout: number;
  // Brute force protection
  failedAttempts: number;
  setFailedAttempts: (count: number) => void;
  lockCooldownEnd: number | null;
  setLockCooldown: (endTime: number) => void;
  clearLockCooldown: () => void;
}

const defaultSettings: SecuritySettings = {
  confidentialMode: false,
};

const SecurityContext = createContext<SecurityContextType | null>(null);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true); // Start locked by default
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [isPinConfigured, setIsPinConfigured] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(0);
  const [failedAttempts, setFailedAttemptsState] = useState(0);
  const [lockCooldownEnd, setLockCooldownEnd] = useState<number | null>(null);
  
  const isSavingRef = useRef(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number>(0);

  // Initialize failed attempts from sessionStorage
  useEffect(() => {
    const storedAttempts = sessionStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (storedAttempts) {
      setFailedAttemptsState(parseInt(storedAttempts, 10));
    }
    
    const storedCooldown = sessionStorage.getItem(LOCK_COOLDOWN_KEY);
    if (storedCooldown) {
      const cooldownEnd = parseInt(storedCooldown, 10);
      if (cooldownEnd > Date.now()) {
        setLockCooldownEnd(cooldownEnd);
      } else {
        sessionStorage.removeItem(LOCK_COOLDOWN_KEY);
      }
    }
  }, []);

  // Persist failed attempts to sessionStorage
  const setFailedAttempts = useCallback((count: number) => {
    setFailedAttemptsState(count);
    if (count > 0) {
      sessionStorage.setItem(FAILED_ATTEMPTS_KEY, count.toString());
    } else {
      sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
    }
  }, []);

  // Set lock cooldown (brute force protection)
  const setLockCooldown = useCallback((endTime: number) => {
    setLockCooldownEnd(endTime);
    sessionStorage.setItem(LOCK_COOLDOWN_KEY, endTime.toString());
  }, []);

  const clearLockCooldown = useCallback(() => {
    setLockCooldownEnd(null);
    sessionStorage.removeItem(LOCK_COOLDOWN_KEY);
    setFailedAttempts(0);
  }, [setFailedAttempts]);

  // Check if app should be locked on mount
  useEffect(() => {
    const checkLockState = async () => {
      if (!user) {
        setIsLocked(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if PIN is configured
        const { data: credData } = await supabase
          .from('secure_credentials')
          .select('pin_hash')
          .eq('user_id', user.id)
          .maybeSingle();

        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('pin_enabled, auto_lock_timeout, confidential_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        const pinConfigured = !!(credData?.pin_hash && settingsData?.pin_enabled);
        setIsPinConfigured(pinConfigured);
        setAutoLockTimeout(settingsData?.auto_lock_timeout ?? 0);
        setSettings({ confidentialMode: settingsData?.confidential_mode ?? false });

        if (pinConfigured) {
          // Check sessionStorage for unlock state
          const isUnlocked = sessionStorage.getItem(UNLOCK_SESSION_KEY) === 'true';
          setIsLocked(!isUnlocked);
        } else {
          setIsLocked(false);
        }
      } catch (error) {
        console.error('Error checking lock state:', error);
        setIsLocked(false);
      }

      setIsLoading(false);
    };

    checkLockState();
  }, [user]);

  // Handle visibility change (app goes to background/foreground)
  useEffect(() => {
    if (!user || !isPinConfigured) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App went to background - record the time
        backgroundTimeRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        // App came back to foreground
        const timeInBackground = Date.now() - backgroundTimeRef.current;
        const thresholdMs = 30000; // 30 seconds in background = lock
        
        if (backgroundTimeRef.current > 0 && timeInBackground >= thresholdMs) {
          // Lock the app after 30 seconds in background
          setIsLocked(true);
          sessionStorage.removeItem(UNLOCK_SESSION_KEY);
        }
        
        backgroundTimeRef.current = 0;
        setLastActiveTime(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, isPinConfigured]);

  // Inactivity timer - lock after 5 minutes of no activity
  useEffect(() => {
    if (!user || !isPinConfigured || isLocked) return;

    const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        setIsLocked(true);
        sessionStorage.removeItem(UNLOCK_SESSION_KEY);
      }, INACTIVITY_TIMEOUT);
      
      setLastActiveTime(Date.now());
    };

    // Events that reset the inactivity timer
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Start the timer
    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, isPinConfigured, isLocked]);

  // Lock app before page unload (optional extra security)
  useEffect(() => {
    if (!user || !isPinConfigured) return;

    const handleBeforeUnload = () => {
      // Don't clear sessionStorage on refresh, only on tab close
      // This is handled by sessionStorage automatically
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, isPinConfigured]);

  const updateLastActiveTime = useCallback(() => {
    setLastActiveTime(Date.now());
  }, []);

  const lockApp = useCallback(() => {
    setIsLocked(true);
    sessionStorage.removeItem(UNLOCK_SESSION_KEY);
  }, []);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    sessionStorage.setItem(UNLOCK_SESSION_KEY, 'true');
    setLastActiveTime(Date.now());
    clearLockCooldown();
  }, [clearLockCooldown]);

  // Save settings to database
  const saveSettingsToDb = useCallback(async (newSettings: SecuritySettings) => {
    if (!user || isSavingRef.current) return;
    
    isSavingRef.current = true;
    try {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          confidential_mode: newSettings.confidentialMode,
        }, { onConflict: 'user_id' });

      if (settingsError) {
        console.error('Error saving user settings:', settingsError);
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      isSavingRef.current = false;
    }
  }, [user]);

  const toggleConfidentialMode = useCallback(async () => {
    const newSettings = {
      ...settings,
      confidentialMode: !settings.confidentialMode,
    };
    setSettings(newSettings);
    await saveSettingsToDb(newSettings);
  }, [settings, saveSettingsToDb]);

  const updateSettings = useCallback(async (updates: Partial<SecuritySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettingsToDb(newSettings);
  }, [settings, saveSettingsToDb]);

  // Listen for PIN configuration changes
  useEffect(() => {
    if (!user) return;

    const checkPinConfig = async () => {
      const { data: credData } = await supabase
        .from('secure_credentials')
        .select('pin_hash')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('pin_enabled, auto_lock_timeout')
        .eq('user_id', user.id)
        .maybeSingle();

      const pinConfigured = !!(credData?.pin_hash && settingsData?.pin_enabled);
      setIsPinConfigured(pinConfigured);
      setAutoLockTimeout(settingsData?.auto_lock_timeout ?? 0);

      // If PIN was just configured, lock the app
      if (pinConfigured && !isPinConfigured) {
        setIsLocked(true);
        sessionStorage.removeItem(UNLOCK_SESSION_KEY);
      }
      // If PIN was disabled, unlock
      if (!pinConfigured && isPinConfigured) {
        setIsLocked(false);
      }
    };

    // Listen for realtime changes
    const channel = supabase
      .channel('security_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        checkPinConfig();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'secure_credentials',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        checkPinConfig();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isPinConfigured]);

  return (
    <SecurityContext.Provider
      value={{
        settings,
        isLoading,
        toggleConfidentialMode,
        updateSettings,
        isLocked,
        lockApp,
        unlockApp,
        lastActiveTime,
        updateLastActiveTime,
        isPinConfigured,
        autoLockTimeout,
        failedAttempts,
        setFailedAttempts,
        lockCooldownEnd,
        setLockCooldown,
        clearLockCooldown,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
