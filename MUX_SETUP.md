# Configuration Mux - Guide étape par étape

## 1. Créer un compte Mux

1. Allez sur [mux.com](https://mux.com)
2. Créez un compte gratuit
3. Accédez au dashboard

## 2. Récupérer les clés API

### Étape 1 : Aller dans les paramètres
1. Dans le dashboard Mux, cliquez sur **"Settings"** (⚙️)
2. Allez dans **"Access Tokens"**

### Étape 2 : Créer un nouveau token
1. Cliquez sur **"Generate new token"**
2. Donnez un nom : `EzioAcademy Upload Token`
3. Sélectionnez les permissions :
   - ✅ **Video:Read**
   - ✅ **Video:Write**
   - ✅ **Video:Upload**
4. Cliquez sur **"Generate token"**

### Étape 3 : Copier les informations
Vous obtiendrez :
- **Token ID** : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Token Secret** : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 3. Configurer les variables d'environnement

### Pour le développement local (.env.local) :
```env
# Mux Configuration
MUX_TOKEN_ID=your_token_id_here
MUX_TOKEN_SECRET=your_token_secret_here
```

### Pour la production (Vercel/Netlify) :
1. Allez dans les paramètres de votre projet
2. Ajoutez les variables d'environnement :
   - `MUX_TOKEN_ID` = votre_token_id
   - `MUX_TOKEN_SECRET` = votre_token_secret

## 4. Test de l'intégration

### Test de l'API :
```bash
curl -X POST http://localhost:3000/api/upload-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_supabase_token" \
  -d '{"title":"Test Video","description":"Test Description"}'
```

### Réponse attendue :
```json
{
  "uploadId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "uploadUrl": "https://upload.mux.com/...",
  "assetId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "playbackId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "ready"
}
```

## 5. Fonctionnalités implémentées

### ✅ Upload de vidéos :
- Sélection de fichier vidéo
- Upload direct vers Mux
- Barre de progression en temps réel
- Validation des types de fichiers

### ✅ Intégration complète :
- API endpoint `/api/upload-video`
- Authentification et autorisation
- Gestion des erreurs
- Playback ID pour la lecture

### ✅ Interface utilisateur :
- Zone de glisser-déposer
- Informations sur le fichier sélectionné
- Progression de l'upload
- Validation avant soumission

## 6. Prochaines étapes

### Améliorations possibles :
1. **Webhooks Mux** pour notifier quand la vidéo est prête
2. **Polling** pour vérifier le statut de traitement
3. **Gestion des erreurs** plus détaillée
4. **Limites de taille** de fichiers
5. **Compression** automatique des vidéos

### Intégration avec les cours :
1. **Sections de cours** avec vidéos
2. **Progression** de visionnage
3. **Sous-titres** automatiques
4. **Qualité adaptative**

## 7. Dépannage

### Erreurs courantes :

**"Unauthorized"** :
- Vérifiez que les clés Mux sont correctes
- Vérifiez que l'utilisateur est admin/creator

**"Upload failed"** :
- Vérifiez la taille du fichier (max 2GB)
- Vérifiez le format (MP4, MOV, AVI)

**"CORS error"** :
- Vérifiez que `cors_origin: '*'` est configuré dans l'API

## 8. Ressources utiles

- [Documentation Mux](https://docs.mux.com/)
- [API Reference](https://docs.mux.com/api-reference)
- [Upload API](https://docs.mux.com/api-reference/video#operation/create-direct-upload)
- [Webhooks](https://docs.mux.com/guides/webhooks) 