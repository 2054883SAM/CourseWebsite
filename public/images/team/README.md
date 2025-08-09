# Images de l'équipe

Ce dossier contient les photos de profil des membres de l'équipe EzioAcademy.

## Structure attendue

```
team/
├── README.md
└── ezio-wassim-h.jpg  # Photo d'Ezio Wassim H. - Fondateur & CEO
```

## Instructions pour ajouter l'image d'Ezio

1. **Téléchargez l'image** d'Ezio Wassim H. depuis la source fournie
2. **Renommez l'image** en `ezio-wassim-h.jpg`
3. **Placez l'image** dans ce dossier (`public/images/team/`)
4. **Vérifiez le format** : L'image doit être au format JPG, PNG ou WebP
5. **Optimisez l'image** : Recommandé 256x256px ou 512x512px pour une meilleure qualité

## Spécifications techniques

- **Format** : JPG, PNG ou WebP
- **Taille recommandée** : 256x256px minimum, 512x512px optimal
- **Poids maximum** : 500KB
- **Aspect ratio** : 1:1 (carré)

## Utilisation dans le code

L'image est utilisée dans `app/about/page.tsx` avec le chemin :
```jsx
<Image
  src="/images/team/ezio-wassim-h.jpg"
  alt="Ezio Wassim H. - Fondateur & CEO"
  width={128}
  height={128}
  className="object-cover w-full h-full"
  priority
/>
```

## Fallback

Si l'image n'est pas trouvée, le système affichera automatiquement un placeholder avec la lettre "E" dans un cercle gris. 