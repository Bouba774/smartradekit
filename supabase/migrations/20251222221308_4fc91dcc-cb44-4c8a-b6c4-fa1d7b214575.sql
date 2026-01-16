-- Add language preference column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN public.user_settings.language IS 'User preferred language code (en, fr, es, pt, de, it, tr, ar)';