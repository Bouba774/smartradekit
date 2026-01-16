-- Supprimer la politique admin sur secure_credentials car les PINs ne doivent JAMAIS être accessibles
-- même par les admins (protection contre la compromission de compte admin)

DROP POLICY IF EXISTS "Admins can view all credentials" ON public.secure_credentials;

-- Vérifier et supprimer les politiques dupliquées sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;

-- Recréer une seule politique claire pour les profils
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- S'assurer que les admins peuvent toujours voir les profils pour la gestion
CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));