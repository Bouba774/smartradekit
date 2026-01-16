import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

/**
 * ADMIN DATA ACCESS - VERSION SÉCURISÉE
 * ======================================
 * Edge function sécurisée pour l'accès aux données utilisateur par les admins.
 * 
 * Sécurité implémentée:
 * 1. Authentification JWT obligatoire
 * 2. Vérification du rôle admin côté serveur
 * 3. Vérification de session admin valide
 * 4. Protection contre IDOR (validation UUID)
 * 5. Lecture seule uniquement
 * 6. Audit logging de tous les accès
 * 7. Filtrage des données sensibles
 */

type DataType = 'trades' | 'profile' | 'journal' | 'challenges' | 'settings' | 'sessions';

// Validation UUID stricte
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

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
    const { data: isAdminData } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (!isAdminData) {
      // Ne pas révéler l'existence du mode admin
      return new Response(
        JSON.stringify({ error: "Accès refusé" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. VÉRIFIER QUE L'ADMIN N'EST PAS BLOQUÉ
    const { data: isBlocked } = await supabaseAdmin.rpc("is_admin_blocked", {
      p_admin_id: user.id,
    });

    if (isBlocked) {
      return new Response(
        JSON.stringify({ error: "Accès temporairement bloqué" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. VÉRIFIER SESSION ADMIN VALIDE (connexion récente < 30 min)
    const { data: recentLogin } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("attempt_at")
      .eq("admin_id", user.id)
      .eq("success", true)
      .order("attempt_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!recentLogin) {
      return new Response(
        JSON.stringify({ error: "Session admin non initialisée" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const loginTime = new Date(recentLogin.attempt_at).getTime();
    const now = Date.now();
    const thirtyMinutesMs = 30 * 60 * 1000;

    if (now - loginTime > thirtyMinutesMs) {
      return new Response(
        JSON.stringify({ error: "Session admin expirée", sessionExpired: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. PARSER ET VALIDER LA REQUÊTE
    let targetUserId: string;
    let dataType: DataType;
    let action: string;
    
    try {
      const body = await req.json();
      targetUserId = body.targetUserId;
      dataType = body.dataType;
      action = body.action || 'read';
    } catch {
      return new Response(
        JSON.stringify({ error: "Requête invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. PROTECTION IDOR - Validation stricte
    if (!targetUserId || !isValidUUID(targetUserId)) {
      return new Response(
        JSON.stringify({ error: "ID utilisateur invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validDataTypes: DataType[] = ['trades', 'profile', 'journal', 'challenges', 'settings', 'sessions'];
    if (!dataType || !validDataTypes.includes(dataType)) {
      return new Response(
        JSON.stringify({ error: "Type de données invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. LECTURE SEULE UNIQUEMENT
    if (action !== 'read') {
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_id: user.id,
        action: "unauthorized_write_attempt",
        target_user_id: targetUserId,
        details: { attempted_action: action, data_type: dataType },
      });
      
      return new Response(
        JSON.stringify({ error: "Action non autorisée - lecture seule" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. EXTRAIRE L'IP POUR L'AUDIT
    const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";

    // 9. JOURNALISER L'ACCÈS AVANT DE RÉCUPÉRER LES DONNÉES
    await supabaseAdmin.rpc("log_admin_data_access", {
      p_admin_id: user.id,
      p_target_user_id: targetUserId,
      p_action: `view_${dataType}`,
      p_table_name: dataType,
      p_ip_address: ipAddress,
    });

    // 10. RÉCUPÉRER LES DONNÉES SELON LE TYPE
    let data: unknown = null;
    let error: unknown = null;

    switch (dataType) {
      case 'trades':
        const tradesResult = await supabaseAdmin
          .from('trades')
          .select('*')
          .eq('user_id', targetUserId)
          .order('trade_date', { ascending: false });
        data = tradesResult.data;
        error = tradesResult.error;
        break;

      case 'profile':
        const profileResult = await supabaseAdmin
          .from('profiles')
          .select('id, user_id, nickname, bio, trading_style, avatar_url, level, total_points, weekly_objective_trades, monthly_objective_profit, created_at, updated_at')
          .eq('user_id', targetUserId)
          .maybeSingle();
        data = profileResult.data;
        error = profileResult.error;
        break;

      case 'journal':
        const journalResult = await supabaseAdmin
          .from('journal_entries')
          .select('*')
          .eq('user_id', targetUserId)
          .order('entry_date', { ascending: false });
        data = journalResult.data;
        error = journalResult.error;
        break;

      case 'challenges':
        const challengesResult = await supabaseAdmin
          .from('user_challenges')
          .select('*')
          .eq('user_id', targetUserId);
        data = challengesResult.data;
        error = challengesResult.error;
        break;

      case 'settings':
        const settingsResult = await supabaseAdmin
          .from('user_settings')
          .select('id, user_id, currency, sounds, vibration, animations, font_size, background, confidential_mode, pin_enabled, pin_length, max_attempts, biometric_enabled, wipe_on_max_attempts, auto_lock_timeout, language, created_at, updated_at')
          .eq('user_id', targetUserId)
          .maybeSingle();
        // NOTE: pin_hash et pin_salt sont EXCLUS pour la sécurité
        data = settingsResult.data;
        error = settingsResult.error;
        break;

      case 'sessions':
        const sessionsResult = await supabaseAdmin
          .from('user_sessions')
          .select('id, user_id, session_start, session_end, browser_name, browser_version, os_name, os_version, device_type, device_vendor, device_model, is_mobile, country, country_code, city, region, isp, language, timezone, screen_width, screen_height, created_at, updated_at')
          .eq('user_id', targetUserId)
          .order('session_start', { ascending: false })
          .limit(50);
        // NOTE: ip_address et user_agent sont EXCLUS pour la confidentialité
        data = sessionsResult.data;
        error = sessionsResult.error;
        break;
    }

    if (error) {
      console.error("[admin-data-access] Query error:", error);
      return new Response(
        JSON.stringify({ error: "Erreur de récupération" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data, readOnly: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[admin-data-access] Unexpected error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
