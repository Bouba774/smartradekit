-- Add initial capital tracking columns to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS capital_defined boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS capital_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS capital_last_updated timestamp with time zone;

-- Add comment for documentation
COMMENT ON COLUMN public.user_settings.capital_defined IS 'Whether the user has explicitly set their initial capital';
COMMENT ON COLUMN public.user_settings.capital_currency IS 'Currency of the initial capital (USD, EUR, etc.)';
COMMENT ON COLUMN public.user_settings.capital_last_updated IS 'Last time the capital was updated';
COMMENT ON COLUMN public.user_settings.default_capital IS 'Initial trading capital for analytics (equity curve, drawdown, ROI)';