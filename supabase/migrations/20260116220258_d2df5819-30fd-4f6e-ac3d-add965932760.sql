-- =====================================================
-- SECURITY FIX: Remove overly permissive policies
-- The existing user-specific policies already protect data properly
-- These new policies were too permissive (allowing any authenticated user)
-- =====================================================

-- Drop the overly permissive policies we just created
DROP POLICY IF EXISTS "Require auth for profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Require auth for connection_logs access" ON public.connection_logs;
DROP POLICY IF EXISTS "Require auth for user_sessions access" ON public.user_sessions;
DROP POLICY IF EXISTS "Require auth for trades access" ON public.trades;
DROP POLICY IF EXISTS "Require auth for journal_entries access" ON public.journal_entries;
DROP POLICY IF EXISTS "Require auth for ai_conversations access" ON public.ai_conversations;
DROP POLICY IF EXISTS "Require auth for ai_messages access" ON public.ai_messages;
DROP POLICY IF EXISTS "Require auth for mt_accounts access" ON public.mt_accounts;
DROP POLICY IF EXISTS "Require auth for trusted_devices access" ON public.trusted_devices;
DROP POLICY IF EXISTS "Require auth for user_settings access" ON public.user_settings;
DROP POLICY IF EXISTS "Require auth for user_challenges access" ON public.user_challenges;
DROP POLICY IF EXISTS "Require auth for user_consents access" ON public.user_consents;
DROP POLICY IF EXISTS "Require auth for gdpr_requests access" ON public.gdpr_requests;
DROP POLICY IF EXISTS "Require auth for session_anomalies access" ON public.session_anomalies;
DROP POLICY IF EXISTS "Require auth for unauthorized_access_logs access" ON public.unauthorized_access_logs;
DROP POLICY IF EXISTS "Require auth for user_ip_history access" ON public.user_ip_history;
DROP POLICY IF EXISTS "Require auth for user_roles access" ON public.user_roles;
DROP POLICY IF EXISTS "Require auth for banned_users access" ON public.banned_users;
DROP POLICY IF EXISTS "Require auth for email_validation_logs access" ON public.email_validation_logs;
DROP POLICY IF EXISTS "Require auth for admin_audit_logs access" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Require auth for admin_login_attempts access" ON public.admin_login_attempts;