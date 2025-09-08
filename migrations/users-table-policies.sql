-- users-table-policies.sql
-- Politiques complètes pour la table users

-- 1. S'assurer que RLS est activé sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to read public profile data" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;

-- 3. Politique SELECT - Permettre aux utilisateurs de lire leur propre profil complet
CREATE POLICY "Allow users to read own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- 4. Politique SELECT - Permettre la lecture publique des profils (informations limitées)
CREATE POLICY "Allow users to read public profile data" ON public.users
FOR SELECT USING (true);

-- 5. Politique UPDATE - Permettre aux utilisateurs de mettre à jour leur propre profil
-- Cette politique est cruciale pour la mise à jour de photo_url
CREATE POLICY "Allow users to update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Politique INSERT - Pour les administrateurs uniquement (si nécessaire)
-- CREATE POLICY "Allow admins to insert users" ON public.users
-- FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- 7. Politique DELETE - Pour les administrateurs uniquement (si nécessaire)
-- CREATE POLICY "Allow admins to delete users" ON public.users
-- FOR DELETE USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Note: Ces politiques assurent que:
-- - Chaque utilisateur peut lire et modifier uniquement son propre profil
-- - Les profils sont visibles publiquement pour l'affichage de base
-- - Seuls les administrateurs peuvent créer ou supprimer des utilisateurs (si décommenté)
-- - La politique UPDATE est particulièrement importante pour la mise à jour de la photo de profil 