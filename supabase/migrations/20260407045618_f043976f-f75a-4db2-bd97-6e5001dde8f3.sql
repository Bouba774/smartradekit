
-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Compte principal',
  account_type TEXT NOT NULL DEFAULT 'personal',
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_user_order ON public.accounts(user_id, order_index);

-- Trigger for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add account_id to trades
ALTER TABLE public.trades ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
CREATE INDEX idx_trades_account_id ON public.trades(account_id);

-- Add account_id to journal_entries
ALTER TABLE public.journal_entries ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
CREATE INDEX idx_journal_entries_account_id ON public.journal_entries(account_id);

-- Add account_id to user_challenges
ALTER TABLE public.user_challenges ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
CREATE INDEX idx_user_challenges_account_id ON public.user_challenges(account_id);

-- Create function to auto-create default account for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, account_type, is_default, order_index)
  VALUES (NEW.id, 'Compte principal', 'personal', true, 0);
  RETURN NEW;
END;
$$;

-- Trigger to auto-create account on new user
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_account();

-- Create default accounts for existing users who don't have one
INSERT INTO public.accounts (user_id, name, account_type, is_default, order_index)
SELECT p.user_id, 'Compte principal', 'personal', true, 0
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a WHERE a.user_id = p.user_id
);

-- Link existing trades to the default account
UPDATE public.trades t
SET account_id = (
  SELECT a.id FROM public.accounts a 
  WHERE a.user_id = t.user_id AND a.is_default = true
  LIMIT 1
)
WHERE t.account_id IS NULL;

-- Link existing journal entries to the default account
UPDATE public.journal_entries j
SET account_id = (
  SELECT a.id FROM public.accounts a 
  WHERE a.user_id = j.user_id AND a.is_default = true
  LIMIT 1
)
WHERE j.account_id IS NULL;

-- Link existing challenges to the default account
UPDATE public.user_challenges c
SET account_id = (
  SELECT a.id FROM public.accounts a 
  WHERE a.user_id = c.user_id AND a.is_default = true
  LIMIT 1
)
WHERE c.account_id IS NULL;
