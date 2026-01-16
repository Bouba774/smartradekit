-- Create table for email validation logs (GDPR compliant - stores hashed email)
CREATE TABLE public.email_validation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_hash TEXT NOT NULL,
  domain TEXT NOT NULL,
  validation_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'rejected', 'pending_confirmation')),
  rejection_reason TEXT,
  is_disposable BOOLEAN DEFAULT false,
  is_free_provider BOOLEAN DEFAULT false,
  has_mx_record BOOLEAN DEFAULT true,
  domain_age_days INTEGER,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_validation_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view email validation logs"
ON public.email_validation_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert logs (via service role)
CREATE POLICY "System can insert email validation logs"
ON public.email_validation_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_email_validation_logs_domain ON public.email_validation_logs(domain);
CREATE INDEX idx_email_validation_logs_status ON public.email_validation_logs(status);
CREATE INDEX idx_email_validation_logs_created ON public.email_validation_logs(created_at DESC);