-- Enable RLS on user_pin_status view
-- Note: user_pin_status is a VIEW based on secure_credentials table
-- We need to recreate it with security_invoker = true

DROP VIEW IF EXISTS public.user_pin_status;

CREATE VIEW public.user_pin_status
WITH (security_invoker = true)
AS SELECT 
  user_id,
  (pin_hash IS NOT NULL) as has_pin,
  pin_length,
  max_attempts,
  wipe_on_max_attempts,
  biometric_enabled
FROM public.secure_credentials;

-- Grant access to authenticated users (RLS from secure_credentials will apply)
GRANT SELECT ON public.user_pin_status TO authenticated;