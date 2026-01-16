-- 1. Remove sensitive PIN-related columns from user_settings table
-- These columns are already properly stored in secure_credentials table
ALTER TABLE public.user_settings 
DROP COLUMN IF EXISTS pin_hash,
DROP COLUMN IF EXISTS pin_salt;

-- 2. Create a secure function for admin secret management
-- This function allows admins to set/update admin secrets through a controlled interface
CREATE OR REPLACE FUNCTION public.set_admin_secret(p_admin_id uuid, p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_is_admin boolean;
  v_secret_hash text;
BEGIN
  -- Get the calling user's ID
  v_caller_id := auth.uid();
  
  -- Verify caller is an admin
  SELECT public.is_admin(v_caller_id) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied. Only admins can set admin secrets.';
  END IF;
  
  -- Validate input
  IF p_secret IS NULL OR length(trim(p_secret)) < 8 THEN
    RAISE EXCEPTION 'Secret must be at least 8 characters long.';
  END IF;
  
  -- Hash the secret using SHA-256
  v_secret_hash := encode(digest(p_secret, 'sha256'), 'hex');
  
  -- Insert or update the admin secret
  INSERT INTO public.admin_secrets (admin_id, secret_hash, updated_at)
  VALUES (p_admin_id, v_secret_hash, now())
  ON CONFLICT (admin_id) 
  DO UPDATE SET 
    secret_hash = v_secret_hash,
    updated_at = now();
  
  -- Log this action in audit logs
  INSERT INTO public.admin_audit_logs (admin_id, action, details, ip_address)
  VALUES (
    v_caller_id, 
    'admin_secret_updated',
    jsonb_build_object(
      'target_admin_id', p_admin_id,
      'timestamp', now()
    ),
    NULL
  );
  
  RETURN true;
END;
$$;

-- 3. Create a function to delete admin secrets (for admin removal)
CREATE OR REPLACE FUNCTION public.delete_admin_secret(p_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_is_admin boolean;
BEGIN
  -- Get the calling user's ID
  v_caller_id := auth.uid();
  
  -- Verify caller is an admin
  SELECT public.is_admin(v_caller_id) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete admin secrets.';
  END IF;
  
  -- Delete the admin secret
  DELETE FROM public.admin_secrets WHERE admin_id = p_admin_id;
  
  -- Log this action in audit logs
  INSERT INTO public.admin_audit_logs (admin_id, action, details, ip_address)
  VALUES (
    v_caller_id, 
    'admin_secret_deleted',
    jsonb_build_object(
      'target_admin_id', p_admin_id,
      'timestamp', now()
    ),
    NULL
  );
  
  RETURN true;
END;
$$;

-- 4. Add unique constraint on admin_id for admin_secrets if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_secrets_admin_id_key'
  ) THEN
    ALTER TABLE public.admin_secrets ADD CONSTRAINT admin_secrets_admin_id_key UNIQUE (admin_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Constraint already exists
END $$;

-- 5. Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.set_admin_secret(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_admin_secret(uuid) TO authenticated;