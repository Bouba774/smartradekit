-- Add RLS policies for admins to read all user data

-- Trades: Allow admins to view all trades
CREATE POLICY "Admins can view all trades" 
ON public.trades 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Profiles: Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Journal entries: Allow admins to view all entries
CREATE POLICY "Admins can view all journal entries" 
ON public.journal_entries 
FOR SELECT 
USING (is_admin(auth.uid()));

-- User challenges: Allow admins to view all challenges
CREATE POLICY "Admins can view all challenges" 
ON public.user_challenges 
FOR SELECT 
USING (is_admin(auth.uid()));

-- User settings: Allow admins to view all settings
CREATE POLICY "Admins can view all user settings" 
ON public.user_settings 
FOR SELECT 
USING (is_admin(auth.uid()));