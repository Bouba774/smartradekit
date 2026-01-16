-- Enable pgcrypto extension for digest function (used in admin secret verification)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate verify_admin_secret function with correct extension reference
CREATE OR REPLACE FUNCTION public.verify_admin_secret(p_admin_id uuid, p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stored_hash TEXT;
  v_computed_hash TEXT;
BEGIN
  -- Récupérer le hash stocké pour cet admin
  SELECT secret_hash INTO v_stored_hash
  FROM public.admin_secrets
  WHERE admin_id = p_admin_id;
  
  -- Si pas de secret configuré, vérifier le secret global
  IF v_stored_hash IS NULL THEN
    SELECT secret_hash INTO v_stored_hash
    FROM public.admin_secrets
    LIMIT 1;
  END IF;
  
  IF v_stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Comparer le hash du secret fourni avec le hash stocké
  -- Utilise encode/digest pour le hachage SHA-256 depuis l'extension pgcrypto
  v_computed_hash := encode(extensions.digest(p_secret::bytea, 'sha256'), 'hex');
  
  RETURN v_stored_hash = v_computed_hash;
END;
$$;

-- Also update set_admin_secret to use the correct extension path
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
  
  -- Hash the secret using SHA-256 from pgcrypto extension
  v_secret_hash := encode(extensions.digest(p_secret::bytea, 'sha256'), 'hex');
  
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