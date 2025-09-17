'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, dbUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const defaultPriceId = process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID;

  // Récupérer l'ID du plan actuel de l'utilisateur
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user) {
        setCurrentPlanId(null);
        return;
      }

      try {
        // Récupérer les informations d'abonnement Stripe de l'utilisateur
        const response = await fetch('/api/stripe/get-subscription', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentPlanId(data.priceId || null);
        } else {
          // Si l'utilisateur n'a pas d'abonnement actif, vérifier le statut membership
          if (dbUser?.membership === 'subscribed') {
            // Utiliser l'ID du plan par défaut si l'utilisateur est marqué comme abonné
            setCurrentPlanId(defaultPriceId || null);
          } else {
            setCurrentPlanId(null);
          }
        }
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setCurrentPlanId(null);
      }
    };

    fetchCurrentPlan();
  }, [user, dbUser]);

  const handleSubscribe = async () => {
    try {
      setError(null);
      setLoading(true);

      // Create subscription checkout session
      const courseId = searchParams?.get('courseId') || undefined;
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to start checkout');
      }

      window.location.href = data.url as string;
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginToSubscribe = () => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header de la page */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Choisissez votre abonnement
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Accédez à tous nos cours premium et donnez à votre enfant les meilleures chances de
            réussite
          </p>
        </div>

        {/* Container pour les cartes de pricing */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
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
              isCurrent={currentPlanId === defaultPriceId}
              onSubscribe={handleSubscribe}
              onLoginToSubscribe={handleLoginToSubscribe}
              loading={loading}
              error={error}
              user={user}
              badge="Le plus populaire"
            />
          </div>
        </div>

        {/* Section d'informations supplémentaires */}
        <div className="mt-16 text-center">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 text-3xl">💳</div>
              <h4 className="mb-2 font-semibold text-gray-900">Paiement sécurisé</h4>
              <p className="text-sm text-gray-600">Vos données sont protégées par Stripe</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 text-3xl">📞</div>
              <h4 className="mb-2 font-semibold text-gray-900">Support 24/7</h4>
              <p className="text-sm text-gray-600">Notre équipe est là pour vous aider</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-3 text-3xl">🎓</div>
              <h4 className="mb-2 font-semibold text-gray-900">Contenu premium</h4>
              <p className="text-sm text-gray-600">Cours créés par des experts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen w-full bg-gray-50 px-4 py-16">Chargement…</div>}
    >
      <PaymentContent />
    </Suspense>
  );
}
