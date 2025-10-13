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
  const [optimisticSubscription, setOptimisticSubscription] = useState<string | null>(null);
  const defaultPriceId =
    process.env.NODE_ENV === 'production'
      ? (process.env.STRIPE_PRICE_ID ?? process.env.STRIPE_TEST_PRICE_ID)
      : process.env.STRIPE_TEST_PRICE_ID;

  // Récupérer l'ID du plan actuel de l'utilisateur
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user) {
        setCurrentPlanId(null);
        setOptimisticSubscription(null);
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
          // Réinitialiser l'état optimiste si l'utilisateur a un abonnement réel
          if (data.priceId) {
            setOptimisticSubscription(null);
          }
        } else {
          // Si l'utilisateur n'a pas d'abonnement actif, vérifier le statut membership
          if (dbUser?.membership === 'subscribed') {
            // Utiliser l'ID du plan par défaut si l'utilisateur est marqué comme abonné
            setCurrentPlanId(defaultPriceId || null);
            setOptimisticSubscription(null);
          } else {
            setCurrentPlanId(null);
            setOptimisticSubscription(null);
          }
        }
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setCurrentPlanId(null);
        setOptimisticSubscription(null);
      }
    };

    fetchCurrentPlan();
  }, [user, dbUser, defaultPriceId]);

  const handleSubscribe = async () => {
    try {
      setError(null);
      setLoading(true);

      // Mise à jour optimiste : afficher immédiatement que l'utilisateur est abonné
      setOptimisticSubscription(defaultPriceId || null);

      // Create subscription checkout session
      const courseId = searchParams?.get('courseId') || undefined;
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        // En cas d'erreur, annuler la mise à jour optimiste
        setOptimisticSubscription(null);
        throw new Error(data?.error || 'Failed to start checkout');
      }

      // Rediriger vers Stripe
      window.location.href = data.url as string;
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleLoginToSubscribe = () => {
    router.push('/signin');
  };

  return (
    <div className="background-beige min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Header amélioré */}
        <div className="mb-20 text-center">
          <h1
            className="mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 4s ease-in-out infinite',
            }}
          >
            Débloquez le{' '}
            <span
              className="animate-bounce bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text font-extrabold text-transparent"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradientShift 2s ease-in-out infinite, bounce 2s ease-in-out infinite',
              }}
            >
              potentiel infini
            </span>{' '}
            de votre enfant
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            Accédez à notre <span className="font-bold text-blue-600">écosystème éducatif</span> de
            nouvelle génération et donnez à votre enfant les{' '}
            <span className="font-bold text-green-600">meilleures chances de réussite</span>
          </p>
        </div>

        {/* Premium Subscription Card */}
        <div className="mb-24 flex justify-center">
          <div className="w-full max-w-lg">
            <div className="relative">
              {/* Enhanced Halo Effect */}
              <div className="absolute -inset-6 animate-pulse rounded-3xl bg-gradient-to-r from-blue-400/30 via-amber-400/30 to-green-400/30 blur-2xl"></div>
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-500/20 via-amber-500/20 to-green-500/20 blur-xl"></div>

              {/* Main Card */}
              <div className="hover:shadow-3xl relative rounded-3xl border-2 border-blue-200/50 bg-gradient-to-br from-white via-blue-50/50 to-amber-50/30 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]">
                {/* Le plus populaire Badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 transform">
                  <div
                    className="inline-flex items-center gap-2 rounded-full border-2 border-amber-300/50 bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold tracking-wider text-white shadow-xl"
                    style={{
                      boxShadow:
                        '0 0 25px rgba(245, 158, 11, 0.6), 0 4px 15px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <span className="text-lg">⭐</span>
                    <span className="text-lg">Le plus populaire</span>
                  </div>
                </div>

                <div className="m-8 text-center">
                  <h2
                    className="mb-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
                    style={{
                      textShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    ABONNEMENT PREMIUM
                  </h2>
                  <p className="text-lg font-medium text-gray-600">
                    Accès complet à tous les cours
                  </p>
                </div>

                <div className="mb-8 text-center">
                  <div className="mb-4 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-lg text-gray-400 line-through">$70</div>
                      <div className="rounded-full bg-red-200 px-2 py-1 text-sm font-bold tracking-wider text-red-600">
                        -29% OFF
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text font-mono text-7xl font-black text-transparent"
                        style={{
                          textShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                        }}
                      >
                        $50
                      </span>
                      <span className="text-lg font-medium text-gray-500">/mois</span>
                    </div>
                  </div>
                  <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium tracking-wider text-gray-500">
                    • Paiement sécurisé
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  {[
                    'Accès illimité à tous les cours',
                    'Nouveau contenu ajouté chaque mois',
                    'Accès sécurisé et paiement Stripe',
                    'Annulable à tout moment',
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-blue-100/50 bg-white/60 p-3 text-gray-700"
                    >
                      <div
                        className="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{
                          animationDelay: `${index * 0.2}s`,
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                        }}
                      ></div>
                      <span className="text-sm font-medium tracking-wide">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  {user ? (
                    <button
                      onClick={handleSubscribe}
                      disabled={
                        loading ||
                        optimisticSubscription === defaultPriceId ||
                        currentPlanId === defaultPriceId
                      }
                      className="w-full rounded-2xl border-2 border-transparent px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background:
                          optimisticSubscription === defaultPriceId ||
                          currentPlanId === defaultPriceId
                            ? 'linear-gradient(135deg, #10b981, #059669, #047857)'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
                        color: 'white',
                        boxShadow:
                          optimisticSubscription === defaultPriceId ||
                          currentPlanId === defaultPriceId
                            ? '0 0 40px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 4px 15px rgba(16, 185, 129, 0.4)'
                            : '0 0 40px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span>INITIALISATION...</span>
                        </div>
                      ) : optimisticSubscription === defaultPriceId ||
                        currentPlanId === defaultPriceId ? (
                        'ACCÈS ACTIVÉ ✓'
                      ) : (
                        "ACTIVER L'ACCÈS"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleLoginToSubscribe}
                      className="group relative w-full overflow-hidden rounded-2xl px-8 py-4 text-lg font-bold transition-transform duration-300 hover:scale-[1.07]"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
                        color: 'white',
                        boxShadow:
                          '0 0 40px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      <span className="button-glow"></span>
                      CONNEXION REQUISE
                    </button>
                  )}

                  {error && (
                    <div className="mt-6 rounded-xl border border-red-500/50 bg-red-500/20 p-4 font-mono text-sm tracking-wider text-red-600">
                      ERREUR: {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cyberpunk Info Section */}
        <div className="mt-20 text-center">
          <h3
            className="mb-12 bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-3xl font-bold text-transparent"
            style={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            SYSTÈME DE PROTECTION AVANCÉ
          </h3>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="group relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 blur-lg transition-all duration-300 group-hover:blur-xl"></div>
              <div className="relative rounded-2xl border border-blue-500/30 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 text-4xl">🔐</div>
                <h4 className="mb-3 text-xl font-bold tracking-wider text-blue-600">
                  DONNÉES CHIFFRÉES
                </h4>
                <p className="font-mono text-sm tracking-wider text-gray-600">
                  Paiement protégé par Stripe
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 animate-pulse rounded-full bg-blue-500"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-lg transition-all duration-300 group-hover:blur-xl"></div>
              <div className="relative rounded-2xl border border-amber-500/30 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 text-4xl">📞</div>
                <h4 className="mb-3 text-lg font-bold tracking-wider text-amber-600">
                  SUPPORT 24/7
                </h4>
                <p className="text-sm text-gray-600">Notre équipe est là pour vous aider</p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 animate-pulse rounded-full bg-amber-500"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 blur-lg transition-all duration-300 group-hover:blur-xl"></div>
              <div className="relative rounded-2xl border border-green-500/30 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-4 text-4xl">🎓</div>
                <h4 className="mb-3 text-lg font-bold tracking-wider text-green-600">
                  CONTENU PREMIUM
                </h4>
                <p className="font-mono text-sm tracking-wider text-gray-600">
                  Cours créés par des experts
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 animate-pulse rounded-full bg-green-500"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
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
