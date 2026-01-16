import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightResponse } from "../_shared/cors.ts";

/**
 * ADMIN SESSION GUARD
 * ===================
 * Edge function de protection pour toutes les requêtes admin.
 * Vérifie que l'utilisateur:
 * 1. Est authentifié
 * 2. A le rôle admin
 * 3. A une session admin valide
 * 4. N'est pas bloqué
 */

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
        JSON.stringify({ valid: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
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
      return new Response(
        JSON.stringify({ valid: false, error: "Accès temporairement bloqué", blocked: true }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. VÉRIFIER QU'IL Y A EU UNE CONNEXION ADMIN RÉUSSIE RÉCEMMENT
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
        JSON.stringify({ valid: false, error: "Session admin non initialisée" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Vérifier que la connexion date de moins de 30 minutes
    const loginTime = new Date(recentLogin.attempt_at).getTime();
    const now = Date.now();
    const thirtyMinutesMs = 30 * 60 * 1000;

    if (now - loginTime > thirtyMinutesMs) {
      return new Response(
        JSON.stringify({ valid: false, error: "Session admin expirée" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. EXTRAIRE L'IP POUR L'AUDIT
    const ipAddress = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";

    // Session valide
    return new Response(
      JSON.stringify({ 
        valid: true, 
        adminId: user.id,
        email: user.email,
        sessionValidUntil: new Date(loginTime + thirtyMinutesMs).toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[admin-session-guard] Unexpected error:", error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ valid: false, error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
