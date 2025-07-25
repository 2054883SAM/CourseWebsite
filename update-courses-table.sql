-- Script pour mettre à jour la table courses avec les nouveaux champs
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter les nouvelles colonnes à la table courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail_description TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ce_que_vous_allez_apprendre TEXT,
ADD COLUMN IF NOT EXISTS prerequis TEXT,
ADD COLUMN IF NOT EXISTS public_cible TEXT,
ADD COLUMN IF NOT EXISTS duree_estimee TEXT,
ADD COLUMN IF NOT EXISTS niveau_difficulte TEXT CHECK (niveau_difficulte IN ('debutant', 'intermediaire', 'avance')),
ADD COLUMN IF NOT EXISTS playback_id TEXT;

-- Mettre à jour les politiques pour permettre aux creators de créer des cours
DROP POLICY IF EXISTS "Only admins can create courses." ON courses;
CREATE POLICY "Admins and creators can create courses."
ON courses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = (select auth.uid())
        AND (role = 'admin' OR role = 'creator')
    )
);

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position; 