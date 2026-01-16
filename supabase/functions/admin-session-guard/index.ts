import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

/**
 * ADMIN SESSION GUARD - VERSION NIVEAU BANCAIRE
 * ==============================================
 * 
 * Protection multi-couches pour les requêtes admin:
 * 1. Authentification JWT
 * 2. Vérification du rôle admin
 * 3. Validation de session avec expiration
 * 4. Détection d'anomalies (nouveau device, nouvelle IP)
 * 5. Anti-timing attacks
 * 6. Fingerprinting de session
 */

const UNIFORM_DELAY_MS = 200;
const SESSION_DURATION_MINUTES = 30;

// Délai uniforme anti-timing attack
async function uniformDelay(startTime: number): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = UNIFORM_DELAY_MS - elapsed;
  const jitter = Math.random() * 30;
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining + jitter));
  }
}

// Extraction IP sécurisée
function extractIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(',')[0]?.trim()?.slice(0, 45)
    || req.headers.get("cf-connecting-ip")?.slice(0, 45)
    || req.headers.get("x-real-ip")?.slice(0, 45)
    || "unknown";
}

// Génération de fingerprint
async function generateFingerprint(req: Request): Promise<string> {
  const ip = extractIP(req);
  const ua = req.headers.get("user-agent") || "";
  const lang = req.headers.get("accept-language") || "";
  
  const data = `${ip}|${ua.slice(0, 100)}|${lang.slice(0, 50)}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    const ipAddress = extractIP(req);
    const sessionFingerprint = await generateFingerprint(req);
    const storedFingerprint = req.headers.get("x-session-fingerprint");

    // 1. AUTHENTIFICATION JWT OBLIGATOIRE
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. VÉRIFICATION DU RÔLE ADMIN
    const { data: isAdminData } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (!isAdminData) {
      // Log tentative d'accès non-admin
      await supabaseAdmin.from("unauthorized_access_logs").insert({
        user_id: user.id,
        table_name: "admin_session_guard",
        operation: "admin_access_attempt",
        ip_address: ipAddress,
        details: { email: user.email },
      });
      
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Accès refusé" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. VÉRIFIER SI L'ADMIN N'EST PAS BLOQUÉ
    const { data: isBlocked } = await supabaseAdmin.rpc("is_admin_blocked", {
      p_admin_id: user.id,
    });

    if (isBlocked) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Accès temporairement bloqué", blocked: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. VÉRIFIER SESSION ADMIN VALIDE
    const { data: recentLogin } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("attempt_at, ip_address, user_agent")
      .eq("admin_id", user.id)
      .eq("success", true)
      .order("attempt_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!recentLogin) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Session admin non initialisée", requiresAuth: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier expiration
    const loginTime = new Date(recentLogin.attempt_at).getTime();
    const now = Date.now();
    const sessionDurationMs = SESSION_DURATION_MINUTES * 60 * 1000;
    const timeRemaining = sessionDurationMs - (now - loginTime);

    if (timeRemaining <= 0) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ valid: false, error: "Session admin expirée", expired: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. DÉTECTION D'ANOMALIES
    const anomalies: string[] = [];
    
    // Vérifier changement d'IP depuis la connexion
    if (recentLogin.ip_address && recentLogin.ip_address !== ipAddress) {
      anomalies.push("ip_changed");
    }
    
    // Vérifier fingerprint de session
    const fingerprintMatch = !storedFingerprint || storedFingerprint === sessionFingerprint;
    if (!fingerprintMatch) {
      anomalies.push("fingerprint_mismatch");
    }

    // Logger les anomalies détectées
    if (anomalies.length > 0) {
      await supabaseAdmin.from("session_anomalies").insert({
        user_id: user.id,
        anomaly_type: "admin_session_anomaly",
        severity: anomalies.length > 1 ? "high" : "medium",
        details: {
          anomalies,
          original_ip: recentLogin.ip_address,
          current_ip: ipAddress,
          fingerprint_match: fingerprintMatch,
        },
      });
    }

    // 6. CALCULER ALERTES
    const warningThreshold = 5 * 60 * 1000; // 5 minutes
    const sessionExpiring = timeRemaining < warningThreshold;

    await uniformDelay(startTime);
    return new Response(
      JSON.stringify({ 
        valid: true, 
        adminId: user.id,
        email: user.email,
        sessionValidUntil: new Date(loginTime + sessionDurationMs).toISOString(),
        timeRemainingMs: timeRemaining,
        sessionExpiring,
        anomalies: anomalies.length > 0 ? anomalies : undefined,
        sessionFingerprint,
        fingerprintMatch,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[admin-session-guard] Unexpected error:", error);
    
    await uniformDelay(startTime);
    
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ valid: false, error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
