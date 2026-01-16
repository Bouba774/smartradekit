-- Create dedicated extensions schema for better security isolation
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pgcrypto to extensions schema (drop and recreate in new schema)
DROP EXTENSION IF EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Ensure search_path includes extensions schema for all roles
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Update function search paths to include extensions
-- Update existing functions that use pgcrypto to reference extensions schema explicitly
CREATE OR REPLACE FUNCTION public.set_admin_secret(p_admin_id uuid, p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_secret_hash text;
BEGIN
  -- Hash the secret using bcrypt from extensions schema
  v_secret_hash := extensions.crypt(p_secret, extensions.gen_salt('bf', 12));
  
  -- Upsert the secret
  INSERT INTO public.admin_secrets (admin_id, secret_hash, updated_at)
  VALUES (p_admin_id, v_secret_hash, now())
  ON CONFLICT (admin_id) 
  DO UPDATE SET 
    secret_hash = EXCLUDED.secret_hash,
    updated_at = now();
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admin_secret(p_admin_id uuid, p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_stored_hash text;
BEGIN
  SELECT secret_hash INTO v_stored_hash
  FROM public.admin_secrets
  WHERE admin_id = p_admin_id;
  
  IF v_stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN v_stored_hash = extensions.crypt(p_secret, v_stored_hash);
END;
$$;

-- Update hash_pin function if it exists to use extensions schema
CREATE OR REPLACE FUNCTION public.hash_pin_value(p_pin text, p_salt text DEFAULT NULL)
RETURNS TABLE(hash text, salt text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_salt text;
  v_hash text;
BEGIN
  -- Generate salt if not provided
  IF p_salt IS NULL THEN
    v_salt := encode(extensions.gen_random_bytes(32), 'hex');
  ELSE
    v_salt := p_salt;
  END IF;
  
  -- Create hash using SHA-256
  v_hash := encode(extensions.digest(p_pin || v_salt, 'sha256'), 'hex');
  
  RETURN QUERY SELECT v_hash, v_salt;
END;
$$;