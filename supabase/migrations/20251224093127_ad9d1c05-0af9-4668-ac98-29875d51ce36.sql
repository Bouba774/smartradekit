-- Add default calculator settings columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS default_capital numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS default_risk_percent numeric DEFAULT NULL;