-- Update check_rate_limit function with input validation and less info exposure
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text, 
  p_attempt_type text DEFAULT 'login'::text, 
  p_max_attempts integer DEFAULT 5, 
  p_window_minutes integer DEFAULT 15, 
  p_block_minutes integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_record rate_limit_attempts%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Input validation
  IF p_identifier IS NULL OR length(trim(p_identifier)) < 3 OR length(p_identifier) > 255 THEN
    RETURN json_build_object(
      'allowed', false,
      'blocked', true,
      'message', 'Invalid request'
    );
  END IF;
  
  IF p_attempt_type IS NULL OR length(p_attempt_type) > 50 THEN
    RETURN json_build_object(
      'allowed', false,
      'blocked', true,
      'message', 'Invalid request'
    );
  END IF;
  
  -- Sanitize identifier (remove special chars that could cause issues)
  p_identifier := regexp_replace(trim(p_identifier), '[^a-zA-Z0-9@._-]', '', 'g');
  
  v_window_start := v_now - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  SELECT * INTO v_record
  FROM rate_limit_attempts
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
  
  -- Check if currently blocked (return generic message without details)
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
    RETURN json_build_object(
      'allowed', false,
      'blocked', true,
      'message', 'Too many attempts. Please try again later.'
    );
  END IF;
  
  -- If record exists and within window
  IF v_record.id IS NOT NULL THEN
    -- Reset if outside window
    IF v_record.first_attempt_at < v_window_start THEN
      UPDATE rate_limit_attempts
      SET attempts_count = 1,
          first_attempt_at = v_now,
          last_attempt_at = v_now,
          blocked_until = NULL
      WHERE id = v_record.id;
      
      RETURN json_build_object(
        'allowed', true,
        'blocked', false,
        'message', 'OK'
      );
    END IF;
    
    -- Check if max attempts reached
    IF v_record.attempts_count >= p_max_attempts THEN
      v_blocked_until := v_now + (p_block_minutes || ' minutes')::INTERVAL;
      
      UPDATE rate_limit_attempts
      SET blocked_until = v_blocked_until,
          last_attempt_at = v_now
      WHERE id = v_record.id;
      
      -- Return generic message without exposing block duration
      RETURN json_build_object(
        'allowed', false,
        'blocked', true,
        'message', 'Too many attempts. Please try again later.'
      );
    END IF;
    
    -- Increment attempts (don't expose remaining count)
    UPDATE rate_limit_attempts
    SET attempts_count = attempts_count + 1,
        last_attempt_at = v_now
    WHERE id = v_record.id;
    
    RETURN json_build_object(
      'allowed', true,
      'blocked', false,
      'message', 'OK'
    );
  ELSE
    -- Create new record
    INSERT INTO rate_limit_attempts (identifier, attempt_type, attempts_count, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_attempt_type, 1, v_now, v_now);
    
    RETURN json_build_object(
      'allowed', true,
      'blocked', false,
      'message', 'OK'
    );
  END IF;
END;
$$;

-- Update reset_rate_limit function with input validation
CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_identifier text, 
  p_attempt_type text DEFAULT 'login'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF p_identifier IS NULL OR length(trim(p_identifier)) < 3 OR length(p_identifier) > 255 THEN
    RETURN;
  END IF;
  
  IF p_attempt_type IS NULL OR length(p_attempt_type) > 50 THEN
    RETURN;
  END IF;
  
  -- Sanitize identifier
  p_identifier := regexp_replace(trim(p_identifier), '[^a-zA-Z0-9@._-]', '', 'g');
  
  DELETE FROM rate_limit_attempts
  WHERE identifier = p_identifier AND attempt_type = p_attempt_type;
END;
$$;