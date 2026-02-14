import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginConfirmationRequest {
  email: string;
  password: string;
  language: string;
  userAgent?: string;
}

const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Translations for all 8 supported languages
const translations: Record<string, {
  subject: string;
  title: string;
  intro: string;
  deviceDetected: string;
  ctaButton: string;
  expiryNote: string;
  warning: string;
  footer: string;
}> = {
  en: {
    subject: '🔐 Confirm your login - Smart Trade Kit',
    title: 'Login Attempt',
    intro: 'A login attempt was detected on your Smart Trade Kit account. To log in, click the button below.',
    deviceDetected: 'Detected device:',
    ctaButton: '✓ Confirm Login',
    expiryNote: 'This link expires in 15 minutes and can only be used once.',
    warning: 'If you did not attempt to log in, ignore this email and secure your account.',
    footer: 'Your intelligent trading journal'
  },
  fr: {
    subject: '🔐 Confirmez votre connexion - Smart Trade Kit',
    title: 'Tentative de connexion',
    intro: 'Une tentative de connexion a été détectée sur votre compte Smart Trade Kit. Pour vous connecter, cliquez sur le bouton ci-dessous.',
    deviceDetected: 'Appareil détecté:',
    ctaButton: '✓ Confirmer la connexion',
    expiryNote: 'Ce lien expire dans 15 minutes et ne peut être utilisé qu\'une seule fois.',
    warning: 'Si vous n\'avez pas tenté de vous connecter, ignorez cet email et sécurisez votre compte.',
    footer: 'Votre journal de trading intelligent'
  },
  es: {
    subject: '🔐 Confirma tu inicio de sesión - Smart Trade Kit',
    title: 'Intento de inicio de sesión',
    intro: 'Se detectó un intento de inicio de sesión en tu cuenta de Smart Trade Kit. Para iniciar sesión, haz clic en el botón de abajo.',
    deviceDetected: 'Dispositivo detectado:',
    ctaButton: '✓ Confirmar inicio de sesión',
    expiryNote: 'Este enlace caduca en 15 minutos y solo puede usarse una vez.',
    warning: 'Si no intentaste iniciar sesión, ignora este email y asegura tu cuenta.',
    footer: 'Tu diario de trading inteligente'
  },
  pt: {
    subject: '🔐 Confirme seu login - Smart Trade Kit',
    title: 'Tentativa de login',
    intro: 'Uma tentativa de login foi detectada em sua conta Smart Trade Kit. Para fazer login, clique no botão abaixo.',
    deviceDetected: 'Dispositivo detectado:',
    ctaButton: '✓ Confirmar login',
    expiryNote: 'Este link expira em 15 minutos e só pode ser usado uma vez.',
    warning: 'Se você não tentou fazer login, ignore este email e proteja sua conta.',
    footer: 'Seu diário de trading inteligente'
  },
  de: {
    subject: '🔐 Bestätigen Sie Ihre Anmeldung - Smart Trade Kit',
    title: 'Anmeldeversuch',
    intro: 'Ein Anmeldeversuch wurde auf Ihrem Smart Trade Kit-Konto erkannt. Um sich anzumelden, klicken Sie auf die Schaltfläche unten.',
    deviceDetected: 'Erkanntes Gerät:',
    ctaButton: '✓ Anmeldung bestätigen',
    expiryNote: 'Dieser Link läuft in 15 Minuten ab und kann nur einmal verwendet werden.',
    warning: 'Wenn Sie sich nicht anmelden wollten, ignorieren Sie diese E-Mail und sichern Sie Ihr Konto.',
    footer: 'Ihr intelligentes Trading-Tagebuch'
  },
  it: {
    subject: '🔐 Conferma il tuo accesso - Smart Trade Kit',
    title: 'Tentativo di accesso',
    intro: 'È stato rilevato un tentativo di accesso al tuo account Smart Trade Kit. Per accedere, clicca sul pulsante qui sotto.',
    deviceDetected: 'Dispositivo rilevato:',
    ctaButton: '✓ Conferma accesso',
    expiryNote: 'Questo link scade tra 15 minuti e può essere utilizzato solo una volta.',
    warning: 'Se non hai tentato di accedere, ignora questa email e proteggi il tuo account.',
    footer: 'Il tuo diario di trading intelligente'
  },
  tr: {
    subject: '🔐 Girişinizi onaylayın - Smart Trade Kit',
    title: 'Giriş Denemesi',
    intro: 'Smart Trade Kit hesabınızda bir giriş denemesi tespit edildi. Giriş yapmak için aşağıdaki düğmeye tıklayın.',
    deviceDetected: 'Tespit edilen cihaz:',
    ctaButton: '✓ Girişi Onayla',
    expiryNote: 'Bu bağlantı 15 dakika içinde sona erer ve yalnızca bir kez kullanılabilir.',
    warning: 'Giriş yapmaya çalışmadıysanız, bu e-postayı görmezden gelin ve hesabınızı güvence altına alın.',
    footer: 'Akıllı trading günlüğünüz'
  },
  ar: {
    subject: '🔐 أكد تسجيل دخولك - Smart Trade Kit',
    title: 'محاولة تسجيل دخول',
    intro: 'تم اكتشاف محاولة تسجيل دخول على حساب Smart Trade Kit الخاص بك. لتسجيل الدخول، انقر على الزر أدناه.',
    deviceDetected: 'الجهاز المكتشف:',
    ctaButton: '✓ تأكيد تسجيل الدخول',
    expiryNote: 'تنتهي صلاحية هذا الرابط خلال 15 دقيقة ويمكن استخدامه مرة واحدة فقط.',
    warning: 'إذا لم تحاول تسجيل الدخول، تجاهل هذا البريد الإلكتروني وقم بتأمين حسابك.',
    footer: 'مذكرة التداول الذكية الخاصة بك'
  }
};

const getEmailContent = (language: string, confirmUrl: string, userAgent?: string) => {
  const t = translations[language] || translations.en;
  const isRtl = language === 'ar';
  
  const html = `
<!DOCTYPE html>
<html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 520px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 80px rgba(99, 102, 241, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.1);">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 0; text-align: center; background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 14px; text-align: center; vertical-align: middle; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);">
                    <span style="font-size: 28px; line-height: 56px;">📊</span>
                  </td>
                </tr>
              </table>
              <h2 style="color: #ffffff; font-size: 18px; margin: 16px 0 4px; font-weight: 700; letter-spacing: -0.5px;">
                Smart Trade Kit
              </h2>
              <p style="color: #6366f1; font-size: 11px; margin: 0; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                ALPHA FX
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);"></div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 64px; height: 64px; background: rgba(99, 102, 241, 0.15); border-radius: 50%; margin: 0 auto; display: inline-block; line-height: 64px;">
                  <span style="font-size: 32px;">🔐</span>
                </div>
              </div>
              
              <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 16px; font-weight: 700; text-align: center;">
                ${t.title}
              </h1>
              
              <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 24px; text-align: center;">
                ${t.intro}
              </p>
              
              ${userAgent ? `
              <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 12px; padding: 14px 16px; margin-bottom: 28px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
                  <strong style="color: #818cf8;">${t.deviceDetected}</strong><br>
                  <span style="color: #64748b;">${userAgent.substring(0, 80)}...</span>
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 28px;">
                    <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.1);">
                      ${t.ctaButton}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                ⏱️ ${t.expiryNote}
              </p>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px; padding: 14px 16px;">
                <p style="color: #f87171; font-size: 12px; margin: 0; text-align: center; line-height: 1.5;">
                  ⚠️ ${t.warning}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="color: #475569; font-size: 11px; margin: 0; text-align: center; line-height: 1.6;">
                <strong style="color: #64748b;">Smart Trade Kit</strong> - ALPHA FX<br>
                ${t.footer}
              </p>
              <p style="color: #334155; font-size: 10px; margin: 12px 0 0; text-align: center;">
                © ${new Date().getFullYear()} Smart Trade Kit. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: t.subject, html };
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, language, userAgent }: LoginConfirmationRequest = await req.json();

    console.log(`Login confirmation request for: ${email}`);

    // 1. Verify credentials first (without actually logging in)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.log("Invalid credentials for:", email);
      // Return generic error to prevent enumeration
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: language === 'fr' 
            ? 'Authentification échouée. Vérifiez vos identifiants.'
            : 'Authentication failed. Check your credentials.'
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sign out immediately - we only validated credentials
    await supabase.auth.signOut();

    const userId = authData.user.id;

    // 2. Check if user needs email confirmation (existing user migration)
    const { data: needsConfirm } = await supabase.rpc('check_user_needs_email_confirmation', {
      p_user_id: userId
    });

    // 3. Generate secure token
    const token = generateToken();
    const tokenHash = await hashToken(token);

    // 4. Store token in database
    const { error: tokenError } = await supabase.rpc('create_login_token', {
      p_user_id: userId,
      p_token_hash: tokenHash,
      p_expires_minutes: 15,
      p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      p_user_agent: userAgent
    });

    if (tokenError) {
      console.error("Error creating token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to create confirmation token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 5. Build confirmation URL
    const origin = req.headers.get('origin') || 'https://sfdudueswogeusuofbbi.lovable.app';
    const confirmUrl = `${origin}/verify-login?token=${token}`;

    // 6. Send email via Resend
    const resend = new Resend(resendApiKey);
    const { subject, html } = getEmailContent(language, confirmUrl, userAgent);

    const { error: emailError } = await resend.emails.send({
      from: "Smart Trade Kit <noreply@resend.dev>",
      to: [email],
      subject,
      html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Login confirmation email sent to: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: language === 'fr'
          ? 'Un email de confirmation a été envoyé à votre adresse.'
          : 'A confirmation email has been sent to your address.',
        needsEmailConfirmation: needsConfirm
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in auth-send-login-confirmation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});