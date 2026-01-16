-- =====================================================
-- SECURITY HARDENING: Add restrictive RLS policies
-- =====================================================

-- 1. PROFILES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 2. USER_SETTINGS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Public read user_settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3. SECURE_CREDENTIALS TABLE - Block all direct SELECT (use functions instead)
DROP POLICY IF EXISTS "Users can view their own credentials" ON public.secure_credentials;
DROP POLICY IF EXISTS "Public read secure_credentials" ON public.secure_credentials;
DROP POLICY IF EXISTS "Block all direct select on secure_credentials" ON public.secure_credentials;

CREATE POLICY "Block all direct select on secure_credentials"
ON public.secure_credentials FOR SELECT
USING (false);

-- 4. MT_ACCOUNTS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own MT accounts" ON public.mt_accounts;
DROP POLICY IF EXISTS "Public read mt_accounts" ON public.mt_accounts;

CREATE POLICY "Users can view their own MT accounts"
ON public.mt_accounts FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 5. TRADES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Public read trades" ON public.trades;

CREATE POLICY "Users can view their own trades"
ON public.trades FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 6. JOURNAL_ENTRIES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Public read journal_entries" ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 7. USER_CHALLENGES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.user_challenges;
DROP POLICY IF EXISTS "Public read user_challenges" ON public.user_challenges;

CREATE POLICY "Users can view their own challenges"
ON public.user_challenges FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 8. AI_CONVERSATIONS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Public read ai_conversations" ON public.ai_conversations;

CREATE POLICY "Users can view their own conversations"
ON public.ai_conversations FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 9. AI_MESSAGES TABLE - Restrict SELECT to owner of parent conversation
DROP POLICY IF EXISTS "Users can view their own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Public read ai_messages" ON public.ai_messages;

CREATE POLICY "Users can view their own messages"
ON public.ai_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_conversations 
    WHERE id = ai_messages.conversation_id 
    AND (user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

-- 10. USER_SESSIONS TABLE - Restrict SELECT to owner and admins  
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Public read user_sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 11. TRUSTED_DEVICES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own trusted devices" ON public.trusted_devices;
DROP POLICY IF EXISTS "Public read trusted_devices" ON public.trusted_devices;

CREATE POLICY "Users can view their own trusted devices"
ON public.trusted_devices FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 12. CONNECTION_LOGS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own connection logs" ON public.connection_logs;
DROP POLICY IF EXISTS "Public read connection_logs" ON public.connection_logs;

CREATE POLICY "Users can view their own connection logs"
ON public.connection_logs FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 13. USER_IP_HISTORY TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own IP history" ON public.user_ip_history;
DROP POLICY IF EXISTS "Public read user_ip_history" ON public.user_ip_history;

CREATE POLICY "Users can view their own IP history"
ON public.user_ip_history FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 14. USER_CONSENTS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Public read user_consents" ON public.user_consents;

CREATE POLICY "Users can view their own consents"
ON public.user_consents FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 15. GDPR_REQUESTS TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own GDPR requests" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Public read gdpr_requests" ON public.gdpr_requests;

CREATE POLICY "Users can view their own GDPR requests"
ON public.gdpr_requests FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 16. SESSION_ANOMALIES TABLE - Restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Users can view their own anomalies" ON public.session_anomalies;
DROP POLICY IF EXISTS "Public read session_anomalies" ON public.session_anomalies;

CREATE POLICY "Users can view their own anomalies"
ON public.session_anomalies FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 17. BANNED_USERS TABLE - Restrict SELECT to admins only
DROP POLICY IF EXISTS "Admins can view banned users" ON public.banned_users;
DROP POLICY IF EXISTS "Public read banned_users" ON public.banned_users;

CREATE POLICY "Admins can view banned users"
ON public.banned_users FOR SELECT
USING (public.is_admin(auth.uid()));

-- 18. USER_ROLES TABLE - Users can see their own role, admins can see all
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Public read user_roles" ON public.user_roles;

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 19. UNAUTHORIZED_ACCESS_LOGS TABLE - Users can see their own, admins see all
DROP POLICY IF EXISTS "Users can view their own unauthorized access logs" ON public.unauthorized_access_logs;

CREATE POLICY "Users can view their own unauthorized access logs"
ON public.unauthorized_access_logs FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));