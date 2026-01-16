import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

/**
 * SECURITY MIDDLEWARE - VERSION NIVEAU BANCAIRE
 * ==============================================
 * 
 * Middleware central de sécurité implémentant:
 * 1. Anti-timing attacks (délais uniformes)
 * 2. Rate limiting avancé par IP + compte
 * 3. Détection d'anomalies
 * 4. Protection IDOR
 * 5. Token validation avec rotation
 * 6. Anti-replay avec nonces
 * 7. Fingerprinting de session
 */

// ============================================================
// CONSTANTES DE SÉCURITÉ
// ============================================================
const UNIFORM_DELAY_MS = 200; // Délai uniforme anti-timing attack
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_FAILED_AUTH_PER_HOUR = 10;
const SUSPICIOUS_USER_AGENT_PATTERNS = [
  /curl/i, /wget/i, /python/i, /bot/i, /spider/i, /crawl/i,
  /scanner/i, /scraper/i, /nikto/i, /sqlmap/i, /nmap/i
];

// ============================================================
// UTILITAIRES DE SÉCURITÉ
// ============================================================

// Délai uniforme pour prévenir les timing attacks
async function uniformDelay(startTime: number): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = UNIFORM_DELAY_MS - elapsed;
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }
}

// Hash sécurisé pour fingerprinting
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extraction d'IP sécurisée
function extractIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Prendre uniquement la première IP (client réel)
    return forwarded.split(',')[0].trim().slice(0, 45);
  }
  return req.headers.get("cf-connecting-ip")?.slice(0, 45) 
    || req.headers.get("x-real-ip")?.slice(0, 45)
    || "unknown";
}

// Détection de user-agent suspect
function isSuspiciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return SUSPICIOUS_USER_AGENT_PATTERNS.some(pattern => pattern.test(userAgent));
}

// Génération de nonce anti-replay
function generateNonce(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36);
}

// Validation UUID stricte
function isValidUUID(str: string | null): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Fingerprint de session
async function generateSessionFingerprint(req: Request): Promise<string> {
  const ip = extractIP(req);
  const userAgent = req.headers.get("user-agent") || "";
  const acceptLanguage = req.headers.get("accept-language") || "";
  const acceptEncoding = req.headers.get("accept-encoding") || "";
  
  const fingerprint = `${ip}|${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  return hashValue(fingerprint);
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
serve(async (req) => {
  const startTime = Date.now();
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. EXTRACTION DES INFORMATIONS DE REQUÊTE
    const ipAddress = extractIP(req);
    const userAgent = req.headers.get("user-agent");
    const requestNonce = req.headers.get("x-request-nonce");
    const sessionFingerprint = await generateSessionFingerprint(req);
    
    // 2. DÉTECTION USER-AGENT SUSPECT
    if (isSuspiciousUserAgent(userAgent)) {
      console.warn(`[security-middleware] Suspicious user-agent from ${ipAddress}: ${userAgent}`);
      
      await supabaseAdmin.from("connection_logs").insert({
        user_id: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        risk_level: "high",
        risk_factors: ["suspicious_user_agent"],
        action_taken: "flagged",
      });
    }

    // 3. PARSING DU BODY
    let body: {
      action?: string;
      targetUserId?: string;
      checkRateLimit?: boolean;
      validateToken?: boolean;
      checkAnomaly?: boolean;
      userId?: string;
    };

    try {
      body = await req.json();
    } catch {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, targetUserId, userId } = body;

    // 4. PROTECTION IDOR - Validation stricte des UUIDs
    if (targetUserId && !isValidUUID(targetUserId)) {
      console.warn(`[security-middleware] IDOR attempt: invalid UUID ${targetUserId} from ${ipAddress}`);
      
      await supabaseAdmin.from("unauthorized_access_logs").insert({
        user_id: userId || null,
        table_name: "security_middleware",
        operation: "idor_attempt",
        ip_address: ipAddress,
        details: { targetUserId, action },
      });
      
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. RATE LIMITING PAR IP
    const { data: rateLimitResult } = await supabaseAdmin.rpc("check_rate_limit", {
      p_identifier: ipAddress,
      p_attempt_type: "api_request",
      p_max_attempts: MAX_REQUESTS_PER_MINUTE,
      p_window_minutes: 1,
      p_block_minutes: 5,
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      console.warn(`[security-middleware] Rate limit exceeded for ${ipAddress}`);
      
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Too many requests", blocked: true }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. VALIDATION ANTI-REPLAY (si nonce fourni)
    if (requestNonce) {
      const { data: nonceValid } = await supabaseAdmin.rpc("validate_request_nonce", {
        p_nonce: requestNonce,
        p_endpoint: action || "unknown",
        p_user_id: userId || null,
      });

      if (!nonceValid) {
        console.warn(`[security-middleware] Replay attack detected from ${ipAddress}, nonce: ${requestNonce}`);
        
        await supabaseAdmin.from("unauthorized_access_logs").insert({
          user_id: userId || null,
          table_name: "security_middleware",
          operation: "replay_attack",
          ip_address: ipAddress,
          details: { nonce: requestNonce, action },
        });
        
        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ error: "Invalid request" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 7. ACTIONS SPÉCIFIQUES
    switch (action) {
      case "check_rate_limit": {
        const identifier = body.userId || ipAddress;
        const { data } = await supabaseAdmin.rpc("check_rate_limit", {
          p_identifier: identifier,
          p_attempt_type: "login",
          p_max_attempts: 5,
          p_window_minutes: 15,
          p_block_minutes: 30,
        });
        
        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ rateLimit: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "validate_session": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          await uniformDelay(startTime);
          return new Response(
            JSON.stringify({ valid: false, error: "No token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
          await uniformDelay(startTime);
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Vérifier le fingerprint de session si existant
        const storedFingerprint = req.headers.get("x-session-fingerprint");
        const fingerprintMatch = !storedFingerprint || storedFingerprint === sessionFingerprint;

        if (!fingerprintMatch) {
          console.warn(`[security-middleware] Session fingerprint mismatch for user ${user.id}`);
          
          await supabaseAdmin.from("session_anomalies").insert({
            user_id: user.id,
            anomaly_type: "fingerprint_mismatch",
            severity: "high",
            details: {
              expected: storedFingerprint.slice(0, 16) + "...",
              actual: sessionFingerprint.slice(0, 16) + "...",
            },
          });
        }

        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ 
            valid: true, 
            userId: user.id,
            sessionFingerprint,
            fingerprintMatch,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_anomaly": {
        if (!userId || !isValidUUID(userId)) {
          await uniformDelay(startTime);
          return new Response(
            JSON.stringify({ error: "Invalid user ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Compter les IPs récentes
        const { data: recentIPs } = await supabaseAdmin.rpc("count_recent_ips", {
          p_user_id: userId,
          p_minutes: 30,
        });

        // Compter les anomalies
        const { data: anomalyCount } = await supabaseAdmin.rpc("get_user_anomalies_count", {
          p_user_id: userId,
        });

        const isAnomalous = (recentIPs || 0) > 3 || (anomalyCount || 0) > 2;

        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ 
            anomalous: isAnomalous,
            recentIPs: recentIPs || 0,
            unresolvedAnomalies: anomalyCount || 0,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate_nonce": {
        const nonce = generateNonce();
        
        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ nonce, sessionFingerprint }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "log_security_event": {
        const { eventType, details } = body as any;
        
        if (userId && isValidUUID(userId)) {
          await supabaseAdmin.from("connection_logs").insert({
            user_id: userId,
            ip_address: ipAddress,
            user_agent: userAgent,
            risk_level: details?.severity || "low",
            risk_factors: [eventType],
            action_taken: "logged",
          });
        }

        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ logged: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default: {
        // Réponse par défaut avec les contrôles de sécurité de base
        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ 
            status: "ok",
            sessionFingerprint,
            newNonce: generateNonce(),
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

  } catch (error) {
    console.error("[security-middleware] Unexpected error:", error);
    
    // Toujours appliquer le délai uniforme même en cas d'erreur
    await uniformDelay(startTime);
    
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
