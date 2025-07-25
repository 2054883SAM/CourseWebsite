# Configuration Supabase

Ce guide vous aide à configurer Supabase pour votre application de cours vidéo.

## 1. Configuration de la base de données

### 1.1 Créer les tables

1. Allez dans votre dashboard Supabase
2. Naviguez vers **SQL Editor**
3. Exécutez le script `supabase-schema.sql` pour créer toutes les tables

### 1.2 Mettre à jour la table courses (si déjà existante)

Si vous avez déjà une table `courses`, exécutez ce script pour ajouter les nouveaux champs :

```sql
-- Ajouter les nouvelles colonnes à la table courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS thumbnail_description TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ce_que_vous_allez_apprendre TEXT,
ADD COLUMN IF NOT EXISTS prerequis TEXT,
ADD COLUMN IF NOT EXISTS public_cible TEXT,
ADD COLUMN IF NOT EXISTS duree_estimee TEXT,
ADD COLUMN IF NOT EXISTS niveau_difficulte TEXT CHECK (niveau_difficulte IN ('debutant', 'intermediaire', 'avance'));

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
```

## 2. Configuration du Storage

### 2.1 Créer le bucket pour les thumbnails

1. Allez dans **Storage** dans votre dashboard Supabase
2. Cliquez sur **New bucket**
3. Nommez-le `course-thumbnails`
4. Cochez **Public bucket** pour permettre l'accès public aux images
5. Cliquez sur **Create bucket**

### 2.2 Configurer les politiques RLS pour le bucket thumbnails

1. Allez dans **Storage** > **Policies**
2. Sélectionnez le bucket `course-thumbnails`
3. Cliquez sur **New Policy**
4. Utilisez ce script :

```sql
-- Politique pour permettre l'upload de thumbnails
CREATE POLICY "Allow authenticated users to upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-thumbnails' AND
    (storage.foldername(name))[1] = 'public'
);

-- Politique pour permettre la lecture publique des thumbnails
CREATE POLICY "Allow public read access to thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');

-- Politique pour permettre la suppression de ses propres thumbnails
CREATE POLICY "Allow users to delete their own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.3 Créer le bucket pour les vidéos (optionnel)

Si vous voulez stocker des vidéos dans Supabase (en plus de Mux) :

1. Créez un nouveau bucket nommé `course-videos`
2. **Ne cochez PAS** Public bucket (les vidéos restent privées)
3. Ajoutez les politiques RLS appropriées

## 3. Configuration des variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

## 4. Vérification

1. Testez la création d'un cours avec une image
2. Vérifiez que l'image s'affiche correctement
3. Vérifiez que tous les nouveaux champs sont sauvegardés

## 5. Dépannage

### Problème : "bucket not found"
- Vérifiez que le bucket `course-thumbnails` existe
- Vérifiez que les politiques RLS sont correctement configurées

### Problème : "permission denied"
- Vérifiez que l'utilisateur est authentifié
- Vérifiez que l'utilisateur a le rôle `admin` ou `creator`

### Problème : "column does not exist"
- Exécutez le script SQL pour ajouter les nouvelles colonnes
- Vérifiez que le script s'est bien exécuté sans erreur 