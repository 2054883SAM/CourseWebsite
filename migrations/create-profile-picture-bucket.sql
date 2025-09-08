-- create-profile-picture-bucket.sql
-- Création et configuration du bucket de stockage pour les photos de profil

-- 1. Créer le bucket s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-picture', 'profile-picture', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. S'assurer que RLS est activé sur les objets storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Allow authenticated users to upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile picture" ON storage.objects;

-- 4. Politique INSERT - Permettre aux utilisateurs authentifiés d'uploader leur photo de profil
CREATE POLICY "Allow authenticated users to upload profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-picture' 
  AND auth.role() = 'authenticated'
  AND STARTS_WITH(name, auth.uid() || '/')
);

-- 5. Politique SELECT - Permettre la lecture publique des photos de profil
CREATE POLICY "Allow public read access to profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-picture');

-- 6. Politique UPDATE - Permettre aux utilisateurs de mettre à jour leur propre photo
CREATE POLICY "Allow users to update their own profile picture" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-picture' 
  AND auth.role() = 'authenticated'
  AND STARTS_WITH(name, auth.uid() || '/')
);

-- 7. Politique DELETE - Permettre aux utilisateurs de supprimer leur propre photo
CREATE POLICY "Allow users to delete their own profile picture" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-picture' 
  AND auth.role() = 'authenticated'
  AND STARTS_WITH(name, auth.uid() || '/')
); 