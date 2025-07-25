-- Script pour mettre à jour la politique RLS de la table sections
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer l'ancienne politique qui ne permet qu'aux admins de créer des sections
DROP POLICY IF EXISTS "Only admins can create sections." ON sections;

-- Créer une nouvelle politique qui permet aux admins et créateurs de cours de créer des sections
CREATE POLICY "Admins and course creators can create sections."
ON sections FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u
        JOIN courses c ON c.id = sections.course_id
        WHERE u.id = (select auth.uid())
        AND (
            u.role = 'admin' 
            OR (u.role = 'creator' AND u.id = c.creator_id)
        )
    )
);

-- Vérifier que la politique a été mise à jour
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'sections' 
AND policyname = 'Admins and course creators can create sections.'; 