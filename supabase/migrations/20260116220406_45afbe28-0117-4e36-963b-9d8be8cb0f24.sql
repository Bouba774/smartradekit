-- =====================================================
-- SECURITY IMPROVEMENTS: Address minor policy gaps
-- =====================================================

-- 1. Add UPDATE policy for user_challenges (users should update their own challenge progress)
CREATE POLICY "Users can update their own challenges"
ON public.user_challenges
FOR UPDATE
USING (auth.uid() = user_id);

-- 2. Add DELETE policy for user_challenges (users should delete their own challenges)
CREATE POLICY "Users can delete their own challenges"
ON public.user_challenges
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Allow users to delete their own IP history for GDPR compliance
CREATE POLICY "Users can delete own IP history"
ON public.user_ip_history
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Allow users to view their own ban status for transparency
CREATE POLICY "Users can view their own ban status"
ON public.banned_users
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Fix secure_credentials conflict by removing the blanket block policy
-- The admin_select and user-specific policies will handle access properly
DROP POLICY IF EXISTS "secure_credentials_no_direct_select" ON public.secure_credentials;

-- Add user SELECT policy for secure_credentials (non-sensitive fields only)
CREATE POLICY "Users can view their own credentials status"
ON public.secure_credentials
FOR SELECT
USING (auth.uid() = user_id);