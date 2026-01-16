-- Fix RLS on user_pin_status view by using a security definer function
-- The view already exists, we just need to ensure the function is properly secured

-- Ensure get_own_pin_status function has proper security
DROP FUNCTION IF EXISTS public.get_own_pin_status();

CREATE OR REPLACE FUNCTION public.get_own_pin_status()
RETURNS TABLE (
  user_id uuid,
  has_pin boolean,
  pin_length integer,
  max_attempts integer,
  wipe_on_max_attempts boolean,
  biometric_enabled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data for the authenticated user
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    sc.user_id,
    (sc.pin_hash IS NOT NULL) as has_pin,
    sc.pin_length,
    sc.max_attempts,
    sc.wipe_on_max_attempts,
    sc.biometric_enabled
  FROM secure_credentials sc
  WHERE sc.user_id = auth.uid();
END;
$$;

-- Ensure get_own_sessions_masked function has proper security
DROP FUNCTION IF EXISTS public.get_own_sessions_masked();

CREATE OR REPLACE FUNCTION public.get_own_sessions_masked()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  session_start timestamptz,
  session_end timestamptz,
  browser_name text,
  browser_version text,
  os_name text,
  os_version text,
  device_type text,
  is_mobile boolean,
  country text,
  country_code text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data for the authenticated user
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.session_start,
    us.session_end,
    us.browser_name,
    us.browser_version,
    us.os_name,
    us.os_version,
    us.device_type,
    us.is_mobile,
    us.country,
    us.country_code,
    us.created_at,
    us.updated_at
  FROM user_sessions us
  WHERE us.user_id = auth.uid();
END;
$$;

-- Grant execute permissions to authenticated users only
REVOKE ALL ON FUNCTION public.get_own_pin_status() FROM public;
GRANT EXECUTE ON FUNCTION public.get_own_pin_status() TO authenticated;

REVOKE ALL ON FUNCTION public.get_own_sessions_masked() FROM public;
GRANT EXECUTE ON FUNCTION public.get_own_sessions_masked() TO authenticated;