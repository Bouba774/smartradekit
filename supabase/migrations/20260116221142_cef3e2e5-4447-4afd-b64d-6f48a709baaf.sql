-- Remove unsafe RLS policies that accidentally allow anonymous writes
-- (Using auth.uid() IS NULL does NOT represent “service role”; it can match unauthenticated/anon contexts)

DROP POLICY IF EXISTS "connection_logs_insert_service" ON public.connection_logs;
DROP POLICY IF EXISTS "Service role can insert email validation logs" ON public.email_validation_logs;
DROP POLICY IF EXISTS "Service role can insert anomalies" ON public.session_anomalies;
DROP POLICY IF EXISTS "Service role can insert unauthorized access logs" ON public.unauthorized_access_logs;

DROP POLICY IF EXISTS "Service role can insert IP history" ON public.user_ip_history;
DROP POLICY IF EXISTS "Service role can update IP history" ON public.user_ip_history;
DROP POLICY IF EXISTS "Service role can delete IP history" ON public.user_ip_history;

-- (Optional hardening) Ensure anonymous users cannot write even if future policies are added accidentally
REVOKE INSERT, UPDATE, DELETE ON public.connection_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.email_validation_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.session_anomalies FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.unauthorized_access_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_ip_history FROM anon;