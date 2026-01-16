import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook de sécurité niveau bancaire
 * ================================
 * 
 * Fonctionnalités:
 * - Génération de nonces anti-replay
 * - Fingerprinting de session
 * - Validation de session
 * - Détection d'anomalies
 * - Rate limiting client-side
 */

interface SecurityState {
  sessionFingerprint: string | null;
  lastNonce: string | null;
  requestCount: number;
  lastRequestTime: number;
}

// Rate limiting client-side
const MAX_REQUESTS_PER_SECOND = 10;
const REQUEST_WINDOW_MS = 1000;

export const useSecurityMiddleware = () => {
  const { user } = useAuth();
  const stateRef = useRef<SecurityState>({
    sessionFingerprint: null,
    lastNonce: null,
    requestCount: 0,
    lastRequestTime: 0,
  });

  // Client-side rate limiting
  const checkClientRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    if (now - state.lastRequestTime > REQUEST_WINDOW_MS) {
      // Reset window
      state.requestCount = 1;
      state.lastRequestTime = now;
      return true;
    }

    state.requestCount++;
    if (state.requestCount > MAX_REQUESTS_PER_SECOND) {
      console.warn('[SecurityMiddleware] Client-side rate limit exceeded');
      return false;
    }

    return true;
  }, []);

  // Générer un nonce anti-replay
  const generateNonce = useCallback(async (): Promise<string | null> => {
    if (!checkClientRateLimit()) return null;

    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          action: 'generate_nonce',
          userId: user?.id,
        },
      });

      if (error) throw error;

      stateRef.current.lastNonce = data.nonce;
      stateRef.current.sessionFingerprint = data.sessionFingerprint;

      return data.nonce;
    } catch (error) {
      console.error('[SecurityMiddleware] Nonce generation failed:', error);
      return null;
    }
  }, [user?.id, checkClientRateLimit]);

  // Valider la session actuelle
  const validateSession = useCallback(async (): Promise<{
    valid: boolean;
    fingerprintMatch: boolean;
  } | null> => {
    if (!checkClientRateLimit()) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { valid: false, fingerprintMatch: false };
      }

      const headers: Record<string, string> = {};
      if (stateRef.current.sessionFingerprint) {
        headers['x-session-fingerprint'] = stateRef.current.sessionFingerprint;
      }

      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          action: 'validate_session',
          userId: user?.id,
        },
        headers,
      });

      if (error) throw error;

      // Mettre à jour le fingerprint
      if (data.sessionFingerprint) {
        stateRef.current.sessionFingerprint = data.sessionFingerprint;
      }

      return {
        valid: data.valid,
        fingerprintMatch: data.fingerprintMatch,
      };
    } catch (error) {
      console.error('[SecurityMiddleware] Session validation failed:', error);
      return null;
    }
  }, [user?.id, checkClientRateLimit]);

  // Vérifier les anomalies de l'utilisateur
  const checkAnomalies = useCallback(async (): Promise<{
    anomalous: boolean;
    recentIPs: number;
    unresolvedAnomalies: number;
  } | null> => {
    if (!user?.id || !checkClientRateLimit()) return null;

    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          action: 'check_anomaly',
          userId: user.id,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SecurityMiddleware] Anomaly check failed:', error);
      return null;
    }
  }, [user?.id, checkClientRateLimit]);

  // Vérifier le rate limit serveur
  const checkServerRateLimit = useCallback(async (): Promise<{
    allowed: boolean;
    blocked: boolean;
  } | null> => {
    if (!checkClientRateLimit()) return null;

    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: {
          action: 'check_rate_limit',
          userId: user?.id,
        },
      });

      if (error) throw error;
      return data.rateLimit;
    } catch (error) {
      console.error('[SecurityMiddleware] Rate limit check failed:', error);
      return null;
    }
  }, [user?.id, checkClientRateLimit]);

  // Logger un événement de sécurité
  const logSecurityEvent = useCallback(async (
    eventType: string,
    details?: Record<string, unknown>
  ): Promise<void> => {
    if (!checkClientRateLimit()) return;

    try {
      await supabase.functions.invoke('security-middleware', {
        body: {
          action: 'log_security_event',
          userId: user?.id,
          eventType,
          details,
        },
      });
    } catch (error) {
      console.error('[SecurityMiddleware] Event logging failed:', error);
    }
  }, [user?.id, checkClientRateLimit]);

  // Obtenir les headers sécurisés pour les requêtes
  const getSecureHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    
    if (stateRef.current.lastNonce) {
      headers['x-request-nonce'] = stateRef.current.lastNonce;
    }
    
    if (stateRef.current.sessionFingerprint) {
      headers['x-session-fingerprint'] = stateRef.current.sessionFingerprint;
    }

    return headers;
  }, []);

  // Effectuer une requête sécurisée
  const secureRequest = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    // Vérification client-side
    if (!checkClientRateLimit()) {
      console.warn('[SecurityMiddleware] Request blocked by client rate limit');
      return null;
    }

    // Générer un nouveau nonce pour la requête
    await generateNonce();

    return fn();
  }, [checkClientRateLimit, generateNonce]);

  return {
    // Fonctions de validation
    generateNonce,
    validateSession,
    checkAnomalies,
    checkServerRateLimit,
    logSecurityEvent,
    
    // Helpers
    getSecureHeaders,
    secureRequest,
    checkClientRateLimit,
    
    // État
    sessionFingerprint: stateRef.current.sessionFingerprint,
  };
};

export default useSecurityMiddleware;
