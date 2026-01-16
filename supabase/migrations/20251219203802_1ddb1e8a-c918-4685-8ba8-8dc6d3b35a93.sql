-- Create user_sessions table to track detailed user information
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  
  -- Device & Browser info
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  device_vendor TEXT, -- Apple, Samsung, etc.
  device_model TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  language TEXT,
  user_agent TEXT,
  
  -- Geolocation (from IP)
  ip_address TEXT,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  isp TEXT,
  
  -- Session metadata
  is_mobile BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_start ON public.user_sessions(session_start DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();