import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

// ============================================================
// CONFIGURATION SÉCURISÉE NIVEAU BANCAIRE
// ============================================================
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MINUTES = 10;
const UNIFORM_DELAY_MS = 250; // Anti-timing attack
const MAX_SECRET_LENGTH = 100;
const MIN_SECRET_LENGTH = 1;

// ============================================================
// FONCTIONS UTILITAIRES DE SÉCURITÉ
// ============================================================

// Délai uniforme anti-timing attack
async function uniformDelay(startTime: number): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = UNIFORM_DELAY_MS - elapsed;
  // Ajouter un jitter aléatoire pour éviter les patterns
  const jitter = Math.random() * 50;
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining + jitter));
  }
}

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
  acceptLanguage: string;
} {
  const userAgent = req.headers.get("user-agent") || "unknown";
  const acceptLanguage = req.headers.get("accept-language") || "unknown";
  const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim()?.slice(0, 45)
    || req.headers.get("cf-connecting-ip")?.slice(0, 45)
    || req.headers.get("x-real-ip")?.slice(0, 45)
    || "unknown";
  
  let browser = "Unknown";
  let os = "Unknown";
  
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
  
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac") && !userAgent.includes("iPhone") && !userAgent.includes("iPad")) os = "macOS";
  else if (userAgent.includes("Linux") && !userAgent.includes("Android")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  
  return { ipAddress, userAgent, browser, os, acceptLanguage };
}

// Validation stricte du format d'entrée - Protection XSS/Injection
function validateSecretFormat(secret: unknown): secret is string {
  if (typeof secret !== 'string') return false;
  if (secret.length < MIN_SECRET_LENGTH || secret.length > MAX_SECRET_LENGTH) return false;
  // Blocage caractères dangereux
  if (/[<>{}[\]\\;`$]/.test(secret)) return false;
  // Blocage patterns d'injection SQL/NoSQL
  if (/('|"|--|;|\/\*|\*\/|union|select|insert|delete|update|drop|exec|xp_)/i.test(secret)) return false;
  return true;
}

// Génération de fingerprint de session
async function generateFingerprint(req: Request): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() || "";
  const ua = req.headers.get("user-agent") || "";
  const lang = req.headers.get("accept-language") || "";
  
  const data = `${ip}|${ua.slice(0, 100)}|${lang.slice(0, 50)}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
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

    // 1. AUTHENTIFICATION JWT OBLIGATOIRE
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      await uniformDelay(startTime);
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
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RÉPONSE IDENTIQUE pour admin et non-admin - anti-enumération
    if (!isAdminData) {
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ success: false, message: "Validation échouée" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. EXTRACTION INFORMATIONS APPAREIL POUR AUDIT
    const deviceInfo = extractDeviceInfo(req);
    const sessionFingerprint = await generateFingerprint(req);
    
    // 4. PARSING ET VALIDATION DU SECRET
    let secret: string;
    try {
      const body = await req.json();
      
      if (!validateSecretFormat(body.secret)) {
        await uniformDelay(startTime);
        return new Response(
          JSON.stringify({ success: false, message: "Validation échouée" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      secret = body.secret.trim();
    } catch {
      await uniformDelay(startTime);
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
      await uniformDelay(startTime);
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
      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isValidSecret) {
      // 8a. SUCCÈS - Journaliser avec fingerprint
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
          accept_language: deviceInfo.acceptLanguage,
          session_fingerprint: sessionFingerprint,
          timestamp: new Date().toISOString(),
        },
      });

      // Générer un token de session admin temporaire signé
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await uniformDelay(startTime);
      return new Response(
        JSON.stringify({ 
          success: true,
          sessionToken,
          sessionFingerprint,
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

      // Audit log détaillé pour l'échec - JAMAIS le secret en clair
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
          session_fingerprint: sessionFingerprint,
          timestamp: new Date().toISOString(),
        },
      });

      // Messages génériques - AUCUNE indication du nombre de tentatives
      await uniformDelay(startTime);
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
    
    // Toujours appliquer le délai uniforme
    await uniformDelay(startTime);
    
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
