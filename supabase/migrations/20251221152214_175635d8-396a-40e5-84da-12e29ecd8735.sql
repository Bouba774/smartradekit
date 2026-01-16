-- Fix EXPOSED_SENSITIVE_DATA: Allow users to view their own connection logs
CREATE POLICY "Users can view their own connection logs"
ON public.connection_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Fix MISSING_RLS_PROTECTION: Enable RLS on user_sessions_masked view
-- Note: user_sessions_masked is a VIEW, not a table. We need to check if RLS can be applied.
-- For views, we typically control access through the underlying table's RLS policies.
-- The view is based on user_sessions which already has proper RLS.

-- However, if the view bypasses RLS (security_invoker = false by default), we need to recreate it
-- with security_invoker = true or create proper policies.

-- First, let's drop and recreate the view with security_invoker = true
DROP VIEW IF EXISTS public.user_sessions_masked;

CREATE VIEW public.user_sessions_masked
WITH (security_invoker = true)
AS SELECT 
  id,
  user_id,
  session_start,
  session_end,
  device_type,
  browser_name,
  browser_version,
  os_name,
  os_version,
  is_mobile,
  country,
  country_code,
  created_at,
  updated_at
FROM public.user_sessions;

-- Grant access to authenticated users (RLS from user_sessions will apply)
GRANT SELECT ON public.user_sessions_masked TO authenticated;