-- =====================================================
-- SECURITY FIX: Block unauthenticated access to all sensitive tables
-- This migration adds base restrictive policies that require authentication
-- =====================================================

-- 1. PROFILES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for profiles access"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. CONNECTION_LOGS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for connection_logs access"
ON public.connection_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. USER_SESSIONS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_sessions access"
ON public.user_sessions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 4. TRADES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for trades access"
ON public.trades
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 5. JOURNAL_ENTRIES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for journal_entries access"
ON public.journal_entries
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 6. AI_CONVERSATIONS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for ai_conversations access"
ON public.ai_conversations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 7. AI_MESSAGES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for ai_messages access"
ON public.ai_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. MT_ACCOUNTS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for mt_accounts access"
ON public.mt_accounts
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 9. TRUSTED_DEVICES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for trusted_devices access"
ON public.trusted_devices
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 10. USER_SETTINGS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_settings access"
ON public.user_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 11. USER_CHALLENGES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_challenges access"
ON public.user_challenges
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 12. USER_CONSENTS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_consents access"
ON public.user_consents
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 13. GDPR_REQUESTS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for gdpr_requests access"
ON public.gdpr_requests
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 14. SESSION_ANOMALIES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for session_anomalies access"
ON public.session_anomalies
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 15. UNAUTHORIZED_ACCESS_LOGS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for unauthorized_access_logs access"
ON public.unauthorized_access_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 16. USER_IP_HISTORY table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_ip_history access"
ON public.user_ip_history
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 17. USER_ROLES table - Block unauthenticated SELECT
CREATE POLICY "Require auth for user_roles access"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 18. BANNED_USERS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for banned_users access"
ON public.banned_users
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 19. EMAIL_VALIDATION_LOGS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for email_validation_logs access"
ON public.email_validation_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 20. ADMIN_AUDIT_LOGS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for admin_audit_logs access"
ON public.admin_audit_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 21. ADMIN_LOGIN_ATTEMPTS table - Block unauthenticated SELECT
CREATE POLICY "Require auth for admin_login_attempts access"
ON public.admin_login_attempts
FOR SELECT
USING (auth.uid() IS NOT NULL);