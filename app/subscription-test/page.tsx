import { SubscriptionCardExample } from '@/components/subscription/SubscriptionCard.example';

export default function SubscriptionTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
          Test des cartes d'abonnement
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Cette page montre différents exemples de cartes d'abonnement, y compris un abonnement actuel.
        </p>
        <SubscriptionCardExample />
      </div>
    </div>
  );
}
