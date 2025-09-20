# SubscriptionCard Component

Un composant réutilisable pour afficher les cartes d'abonnement avec support pour l'abonnement actuel.

## Fonctionnalités

- ✅ Badge "Abonnement actuel" pour l'abonnement actif
- ✅ Style visuel distinct (bordure verte, fond légèrement différent)
- ✅ Bouton désactivé avec texte "Déjà abonné" pour l'abonnement actuel
- ✅ Support des prix barrés et des réductions
- ✅ Liste des fonctionnalités personnalisables
- ✅ Gestion des états de chargement et d'erreur

## Utilisation

```tsx
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';

<SubscriptionCard
  title="Premium"
  description="Accès complet à tous les cours"
  price={50}
  originalPrice={70}
  discount={29}
  features={[
    "Accès illimité à tous les cours",
    "Nouveau contenu ajouté chaque mois",
    "Accès sécurisé et paiement Stripe",
    "Annulable à tout moment"
  ]}
  isCurrent={true} // Indique si c'est l'abonnement actuel
  onSubscribe={handleSubscribe}
  onLoginToSubscribe={handleLoginToSubscribe}
  loading={false}
  error={null}
  user={user}
  badge="Le plus populaire"
/>
```

## Props

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `title` | `string` | ✅ | Titre de l'abonnement |
| `description` | `string` | ✅ | Description de l'abonnement |
| `price` | `number` | ✅ | Prix actuel |
| `originalPrice` | `number` | ❌ | Prix original (pour les réductions) |
| `discount` | `number` | ❌ | Pourcentage de réduction |
| `features` | `string[]` | ✅ | Liste des fonctionnalités |
| `isCurrent` | `boolean` | ❌ | Si c'est l'abonnement actuel (défaut: false) |
| `onSubscribe` | `() => void` | ✅ | Callback pour s'abonner |
| `onLoginToSubscribe` | `() => void` | ✅ | Callback pour se connecter |
| `loading` | `boolean` | ❌ | État de chargement (défaut: false) |
| `error` | `string \| null` | ❌ | Message d'erreur |
| `user` | `any` | ❌ | Utilisateur connecté |
| `badge` | `string` | ❌ | Texte du badge (défaut: "Le plus populaire") |

## Styles

### Abonnement normal
- Bordure grise
- Fond blanc
- Bouton bleu cliquable
- Badge "Le plus populaire" (si fourni)

### Abonnement actuel
- Bordure verte
- Fond vert clair (opacité 30%)
- Bouton gris désactivé
- Badge "Abonnement actuel"
- Texte "Déjà abonné" sur le bouton

## Exemple complet

Voir `SubscriptionCard.example.tsx` pour un exemple complet avec plusieurs abonnements.
