-- Enable RLS on user_pin_status view (if it's a table, otherwise we need different approach)
-- Since user_pin_status appears to be a view, we need to secure it properly

-- First, let's add RLS policies for user_pin_status (assuming it's a view that needs security)
-- Views inherit RLS from their base tables, but we can add explicit policies if it's materialized

-- For user_sessions_masked (appears to be a view as well)
-- Let's check if these are views and create appropriate security

-- Create RLS policies for user_pin_status if it's a table
DO $$ 
BEGIN
  -- Check if user_pin_status is a table (not a view)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_pin_status') THEN
    -- Enable RLS
    ALTER TABLE public.user_pin_status ENABLE ROW LEVEL SECURITY;
    
    -- Users can only view their own PIN status
    CREATE POLICY "Users can view their own pin status"
      ON public.user_pin_status
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Admins can view all PIN statuses
    CREATE POLICY "Admins can view all pin statuses"
      ON public.user_pin_status
      FOR SELECT
      USING (is_admin(auth.uid()));
    
    -- Block all modifications (read-only view of security data)
    CREATE POLICY "No direct modifications to pin status"
      ON public.user_pin_status
      FOR ALL
      USING (false)
      WITH CHECK (false);
  END IF;
  
  -- Check if user_sessions_masked is a table (not a view)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions_masked') THEN
    -- Enable RLS
    ALTER TABLE public.user_sessions_masked ENABLE ROW LEVEL SECURITY;
    
    -- Users can only view their own masked sessions
    CREATE POLICY "Users can view their own masked sessions"
      ON public.user_sessions_masked
      FOR SELECT
      USING (auth.uid() = user_id);
    
    -- Admins can view all masked sessions
    CREATE POLICY "Admins can view all masked sessions"
      ON public.user_sessions_masked
      FOR SELECT
      USING (is_admin(auth.uid()));
    
    -- Block all modifications (derived/masked data should be read-only)
    CREATE POLICY "No direct modifications to masked sessions"
      ON public.user_sessions_masked
      FOR ALL
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;

-- If they are views, we need to ensure the underlying tables have proper RLS
-- The secure_credentials table already has RLS for PIN data
-- The user_sessions table already has RLS for session data

-- Add a security definer function for safe PIN status access
CREATE OR REPLACE FUNCTION public.get_user_pin_status(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'has_pin', (pin_hash IS NOT NULL),
    'pin_length', pin_length,
    'biometric_enabled', biometric_enabled,
    'max_attempts', max_attempts,
    'wipe_on_max_attempts', wipe_on_max_attempts
  )
  FROM public.secure_credentials
  WHERE user_id = p_user_id
  AND (p_user_id = auth.uid() OR is_admin(auth.uid()))
$$;