
-- 1. Set admin secret to "MouliomAndre"
SELECT public.set_admin_secret('f563215a-fc9f-4666-9afe-49b95f73c7e8'::uuid, 'MouliomAndre');

-- 2. Storage: remove insecure public policies
DROP POLICY IF EXISTS "Trade images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own trade images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own trade images" ON storage.objects;
DROP POLICY IF EXISTS "System can upload GDPR exports" ON storage.objects;

-- 3. Realtime: remove sensitive tables from publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_login_attempts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.connection_logs;
ALTER PUBLICATION supabase_realtime DROP TABLE public.session_anomalies;
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_sessions;

-- 4. Remove admin SELECT policy on secure_credentials (PIN hash protection)
DROP POLICY IF EXISTS secure_credentials_admin_select ON public.secure_credentials;

-- 5. Add INSERT policy on connection_logs to enforce user_id = auth.uid()
DROP POLICY IF EXISTS connection_logs_insert_own ON public.connection_logs;
CREATE POLICY connection_logs_insert_own
ON public.connection_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
