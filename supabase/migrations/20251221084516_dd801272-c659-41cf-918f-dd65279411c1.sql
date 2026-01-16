-- Drop and recreate the user_pin_status view with proper security
DROP VIEW IF EXISTS public.user_pin_status;

-- Recreate the view with a WHERE clause to only show current user's data
CREATE VIEW public.user_pin_status 
WITH (security_invoker = true)
AS
SELECT 
  sc.user_id,
  CASE WHEN sc.pin_hash IS NOT NULL THEN true ELSE false END as has_pin,
  COALESCE(sc.pin_length, 4) as pin_length,
  COALESCE(sc.max_attempts, 5) as max_attempts,
  COALESCE(sc.wipe_on_max_attempts, false) as wipe_on_max_attempts,
  COALESCE(sc.biometric_enabled, false) as biometric_enabled
FROM public.secure_credentials sc
WHERE sc.user_id = auth.uid();

-- Add comment for documentation
COMMENT ON VIEW public.user_pin_status IS 'Secure view that only returns PIN status for the authenticated user';