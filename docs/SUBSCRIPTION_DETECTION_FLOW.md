# Flux de détection de l'abonnement actuel

## Vue d'ensemble

Le système détecte automatiquement l'abonnement actuel de l'utilisateur et affiche la carte d'abonnement avec un style distinct et un bouton désactivé.

## Flux de données

### 1. Initialisation
```
Page de paiement → useEffect → fetchCurrentPlan()
```

### 2. Récupération des données
```
fetchCurrentPlan() → API /api/stripe/get-subscription
```

### 3. API get-subscription
```
1. Vérifier l'authentification utilisateur
2. Récupérer le statut membership depuis la DB
3. Si membership = 'subscribed':
   - Chercher le customer Stripe
   - Récupérer les abonnements actifs
   - Retourner le priceId de l'abonnement actif
4. Sinon: retourner null
```

### 4. Comparaison et affichage
```
currentPlanId === defaultPriceId → isCurrent = true
```

## Composants impliqués

### SubscriptionCard
- **Props**: `isCurrent` (boolean)
- **Comportement**: 
  - Si `isCurrent = true`: style vert, bouton désactivé, badge "Abonnement actuel"
  - Si `isCurrent = false`: style normal, bouton cliquable

### Page de paiement
- **État**: `currentPlanId` (string | null)
- **Logique**: Compare `currentPlanId` avec `defaultPriceId`
- **Fallback**: Utilise le statut `membership` de la DB si l'API Stripe échoue

## Gestion des erreurs

1. **API Stripe indisponible**: Fallback sur le statut `membership` de la DB
2. **Utilisateur non connecté**: `isCurrent = false`
3. **Pas d'abonnement actif**: `isCurrent = false`

## Variables d'environnement

- `NEXT_PUBLIC_STRIPE_TEST_PRICE_ID`: ID du plan par défaut (accessible côté client)

## Base de données

### Table `users`
- `membership`: 'free' | 'subscribed'
- Utilisé comme fallback si l'API Stripe échoue

## API Stripe

### Endpoints utilisés
- `stripe.customers.list()`: Récupérer le customer par email
- `stripe.subscriptions.list()`: Récupérer les abonnements actifs

### Données retournées
```json
{
  "priceId": "price_xxx",
  "status": "active",
  "subscriptionId": "sub_xxx",
  "currentPeriodEnd": 1234567890
}
```

## Exemple d'utilisation

```tsx
<SubscriptionCard
  title="Premium"
  price={50}
  isCurrent={currentPlanId === defaultPriceId}
  // ... autres props
/>
```

## Tests

Pour tester la fonctionnalité :
1. Visiter `/subscription-test` pour voir les exemples
2. Visiter `/payment` pour tester avec un utilisateur connecté
3. Modifier le statut `membership` dans la DB pour tester le fallback
