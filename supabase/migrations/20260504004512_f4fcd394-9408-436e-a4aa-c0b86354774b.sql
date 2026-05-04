ALTER TABLE public.trades 
  ADD COLUMN IF NOT EXISTS session_type text,
  ADD COLUMN IF NOT EXISTS session_label text;

CREATE INDEX IF NOT EXISTS idx_trades_session_type ON public.trades(session_type);