# Configuration Supabase Storage - Guide étape par étape

## 1. Accéder à votre projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet CourseWebsite

## 2. Créer le bucket pour les thumbnails

### Étape 1 : Aller dans Storage
1. Dans le menu de gauche, cliquez sur **"Storage"**
2. Cliquez sur **"New bucket"**

### Étape 2 : Créer le bucket `course-thumbnails`
- **Nom du bucket** : `course-thumbnails`
- **Public bucket** : ✅ **Cocher** (pour que les images soient accessibles publiquement)
- **File size limit** : `5 MB` (suffisant pour les thumbnails)
- **Allowed MIME types** : `image/*` (tous les types d'images)

### Étape 3 : Créer le bucket pour les vidéos (optionnel)
- **Nom du bucket** : `course-videos`
- **Public bucket** : ❌ **Ne pas cocher** (les vidéos ne doivent pas être publiques)
- **File size limit** : `2 GB`
- **Allowed MIME types** : `video/*`

## 3. Configurer les politiques RLS (Row Level Security)

### Pour le bucket `course-thumbnails` :

1. Cliquez sur le bucket `course-thumbnails`
2. Allez dans l'onglet **"Policies"**
3. Cliquez sur **"New Policy"**

#### Politique pour l'upload (INSERT) :
```sql
-- Nom : "Allow authenticated users to upload thumbnails"
-- Operation : INSERT
-- Target roles : authenticated
-- Policy definition :
(auth.role() = 'authenticated')
```

#### Politique pour la lecture (SELECT) :
```sql
-- Nom : "Allow public read access to thumbnails"
-- Operation : SELECT
-- Target roles : public
-- Policy definition :
(true)
```

### Pour le bucket `course-videos` (si créé) :

#### Politique pour l'upload (INSERT) :
```sql
-- Nom : "Allow creators and admins to upload videos"
-- Operation : INSERT
-- Target roles : authenticated
-- Policy definition :
(
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'creator')
  )
)
```

#### Politique pour la lecture (SELECT) :
```sql
-- Nom : "Allow enrolled students and course creators to view videos"
-- Operation : SELECT
-- Target roles : authenticated
-- Policy definition :
(
  EXISTS (
    SELECT 1 FROM users u
    LEFT JOIN enrollments e ON e.user_id = u.id
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin' 
      OR u.role = 'creator'
      OR (u.role = 'student' AND e.payment_status = 'paid')
    )
  )
)
```

## 4. Vérifier la configuration

1. Testez l'upload d'une image dans le bucket `course-thumbnails`
2. Vérifiez que l'URL publique est accessible
3. Testez les politiques de sécurité

## 5. Variables d'environnement

Assurez-vous que vos variables d'environnement sont configurées :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 6. Test de l'intégration

Une fois configuré, vous pourrez :
- Uploader des thumbnails depuis l'appareil photo
- Voir les aperçus en temps réel
- Créer des cours avec des images de couverture 