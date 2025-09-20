'use client';

import { SubscriptionCard } from './SubscriptionCard';

// Exemple d'utilisation du composant SubscriptionCard
export function SubscriptionCardExample() {
  const handleSubscribe = () => {
    console.log('Subscribe clicked');
  };

  const handleLoginToSubscribe = () => {
    console.log('Login to subscribe clicked');
  };

  return (
    <div className="space-y-8 p-6">
      {/* Titre de la section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Exemples de cartes d'abonnement
        </h2>
        <p className="text-gray-600">
          La carte du milieu montre l'abonnement actuel avec le nouveau design
        </p>
      </div>

      {/* Grille des abonnements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Abonnement gratuit */}
        <SubscriptionCard
          title="Gratuit"
          description="Accès limité aux cours"
          price={0}
          features={[
            "Accès à 3 cours gratuits",
            "Contenu de base",
            "Support communautaire"
          ]}
          isCurrent={false}
          onSubscribe={handleSubscribe}
          onLoginToSubscribe={handleLoginToSubscribe}
          user={null}
          badge="Gratuit"
        />

        {/* Abonnement premium - actuel */}
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
          isCurrent={true} // Cet abonnement est actuel
          onSubscribe={handleSubscribe}
          onLoginToSubscribe={handleLoginToSubscribe}
          user={{ id: '1', email: 'user@example.com' }}
          badge="Le plus populaire"
        />

        {/* Abonnement entreprise */}
        <SubscriptionCard
          title="Entreprise"
          description="Pour les organisations"
          price={200}
          features={[
            "Tout du Premium",
            "Gestion multi-utilisateurs",
            "Support prioritaire",
            "Rapports d'utilisation"
          ]}
          isCurrent={false}
          onSubscribe={handleSubscribe}
          onLoginToSubscribe={handleLoginToSubscribe}
          user={{ id: '1', email: 'user@example.com' }}
          badge="Entreprise"
        />
      </div>

      {/* Légende */}
      <div className="text-center text-sm text-gray-500">
        <p>✨ La carte Premium montre le nouveau design pour l'abonnement actuel</p>
      </div>
    </div>
  );
}
