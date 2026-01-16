import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

// ============================================================
// CONFIGURATION SÉCURISÉE - AUCUN SECRET EN CLAIR
// ============================================================
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 10;

// ============================================================
// FONCTIONS UTILITAIRES DE SÉCURITÉ
// ============================================================

// Hash SHA-256 sécurisé
async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extraction sécurisée des informations de l'appareil
function extractDeviceInfo(req: Request): {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
} {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() 
    || req.headers.get("cf-connecting-ip") 
    || req.headers.get("x-real-ip")
    || "unknown";
  
  let browser = "Unknown";
  let os = "Unknown";
  
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";
  
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  
  return { ipAddress, userAgent, browser, os };
}

// Validation stricte du format d'entrée
function validateSecretFormat(secret: unknown): secret is string {
  return (
    typeof secret === 'string' &&
    secret.length >= 1 &&
    secret.length <= 100 &&
    !/[<>{}]/.test(secret) // Prévention XSS basique
  );
}

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return handleCorsPreflightResponse(req);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. AUTHENTIFICATION JWT OBLIGATOIRE
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. VÉRIFICATION STRICTE DU RÔLE ADMIN
    const { data: isAdminData, error: adminCheckError } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (adminCheckError) {
      console.error("[validate-admin-secret] Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isAdminData) {
      // Message générique - ne pas révéler l'existence du mode admin
      return new Response(
        JSON.stringify({ error: "Accès refusé" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. EXTRACTION INFORMATIONS APPAREIL POUR AUDIT
    const deviceInfo = extractDeviceInfo(req);
    
    // 4. PARSING ET VALIDATION DU SECRET
    let secret: string;
    try {
      const body = await req.json();
      
      if (!validateSecretFormat(body.secret)) {
        return new Response(
          JSON.stringify({ success: false, message: "Format invalide" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      secret = body.secret.trim();
    } catch {
      return new Response(
        JSON.stringify({ error: "Requête invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. RATE LIMITING - VÉRIFIER SI BLOQUÉ
    const { data: isBlocked } = await supabaseAdmin.rpc("is_admin_blocked", {
      p_admin_id: user.id,
    });

    if (isBlocked) {
      // Journaliser la tentative bloquée
      await supabaseAdmin.from("admin_login_attempts").insert({
        admin_id: user.id,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        success: false,
      });
      
      // Message générique - ne pas révéler la durée exacte
      return new Response(
        JSON.stringify({
          success: false,
          blocked: true,
          message: "Accès temporairement bloqué",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. COMPTER LES ÉCHECS RÉCENTS
    const { data: failureCount } = await supabaseAdmin.rpc("count_admin_failures", {
      p_admin_id: user.id,
    });

    const currentFailures = failureCount || 0;

    // 7. VÉRIFICATION DU SECRET VIA FONCTION SÉCURISÉE EN DB
    const { data: isValidSecret, error: verifyError } = await supabaseAdmin.rpc("verify_admin_secret", {
      p_admin_id: user.id,
      p_secret: secret,
    });

    if (verifyError) {
      console.error("[validate-admin-secret] Verify error:", verifyError);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isValidSecret) {
      // 8a. SUCCÈS - Journaliser
      await supabaseAdmin.from("admin_login_attempts").insert({
        admin_id: user.id,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        success: true,
      });

      // Audit log détaillé
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "admin_login_success",
        ip_address: deviceInfo.ipAddress,
        details: {
          user_agent: deviceInfo.userAgent,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          timestamp: new Date().toISOString(),
        },
      });

      // Générer un token de session admin temporaire
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      return new Response(
        JSON.stringify({ 
          success: true,
          sessionToken,
          expiresAt: sessionExpiry.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // 8b. ÉCHEC - Journaliser et potentiellement bloquer
      const newFailureCount = currentFailures + 1;
      const shouldBlock = newFailureCount >= MAX_ATTEMPTS;
      const blockedUntil = shouldBlock
        ? new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000).toISOString()
        : null;

      await supabaseAdmin.from("admin_login_attempts").insert({
        admin_id: user.id,
        ip_address: deviceInfo.ipAddress,
        user_agent: deviceInfo.userAgent,
        success: false,
        blocked_until: blockedUntil,
      });

      // Audit log détaillé pour l'échec
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "admin_login_failed",
        ip_address: deviceInfo.ipAddress,
        details: {
          user_agent: deviceInfo.userAgent,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          attempt_number: newFailureCount,
          blocked: shouldBlock,
          timestamp: new Date().toISOString(),
        },
      });

      // Messages génériques - AUCUNE indication du nombre de tentatives
      return new Response(
        JSON.stringify({
          success: false,
          blocked: shouldBlock,
          message: shouldBlock
            ? "Accès temporairement bloqué"
            : "Validation échouée",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[validate-admin-secret] Unexpected error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
