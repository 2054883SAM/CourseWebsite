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
  const defaultPriceId = process.env.STRIPE_TEST_PRICE_ID;

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
    <div className="min-h-screen w-full background-beige">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Header amélioré */}
        <div className="mb-20 text-center">
          <h1 className="mb-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800 md:text-5xl" style={{
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease-in-out infinite'
          }}>
            Débloquez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 font-extrabold animate-bounce" style={{
              backgroundSize: '200% 200%',
              animation: 'gradientShift 2s ease-in-out infinite, bounce 2s ease-in-out infinite'
            }}>potentiel infini</span> de votre enfant
          </h1>
          
          <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
            Accédez à notre <span className="font-bold text-blue-600">écosystème éducatif</span> de nouvelle génération 
            et donnez à votre enfant les <span className="font-bold text-green-600">meilleures chances de réussite</span>
          </p>
        </div>

        {/* Premium Subscription Card */}
        <div className="flex justify-center mb-24">
          <div className="w-full max-w-lg">
            <div className="relative">
              {/* Enhanced Halo Effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-400/30 via-amber-400/30 to-green-400/30 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-amber-500/20 to-green-500/20 rounded-3xl blur-xl"></div>
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-amber-50/30 backdrop-blur-xl border-2 border-blue-200/50 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                {/* Le plus populaire Badge */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm tracking-wider shadow-xl border-2 border-amber-300/50" style={{
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.6), 0 4px 15px rgba(245, 158, 11, 0.3)'
                  }}>
                    <span className="text-lg">⭐</span>
                    <span className='text-lg'>Le plus populaire</span>
                  </div>
                </div>

                <div className="text-center m-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent mb-3" style={{
                    textShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                  }}>
                    PREMIUM ACCESS
                  </h2>
                  <p className="text-gray-600 text-lg font-medium">Accès complet à tous les cours</p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex flex-col items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg text-gray-400 line-through font-mono">$70</div>
                      <div className="text-sm text-red-600 font-bold tracking-wider bg-red-200 px-2 py-1 rounded-full">-29% OFF</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-7xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-mono" style={{
                        textShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                      }}>$50</span>
                      <span className="text-lg text-gray-500 font-medium">/mois</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 font-medium tracking-wider bg-gray-100 px-3 py-1 rounded-full inline-block">• Paiement sécurisé</div>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    'Accès illimité à tous les cours',
                    'Nouveau contenu ajouté chaque mois',
                    'Accès sécurisé et paiement Stripe',
                    'Annulable à tout moment',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700 bg-white/60 rounded-xl p-3 border border-blue-100/50">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse flex-shrink-0" style={{
                        animationDelay: `${index * 0.2}s`,
                        boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
                      }}></div>
                      <span className="text-sm font-medium tracking-wide">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  {user ? (
                    <button
                      onClick={handleSubscribe}
                      disabled={loading || (optimisticSubscription === defaultPriceId || currentPlanId === defaultPriceId)}
                      className="w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]"
                      style={{
                        background: (optimisticSubscription === defaultPriceId || currentPlanId === defaultPriceId) 
                          ? 'linear-gradient(135deg, #10b981, #059669, #047857)' 
                          : 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
                        color: 'white',
                        boxShadow: (optimisticSubscription === defaultPriceId || currentPlanId === defaultPriceId)
                          ? '0 0 40px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 4px 15px rgba(16, 185, 129, 0.4)'
                          : '0 0 40px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>INITIALISATION...</span>
                        </div>
                      ) : (optimisticSubscription === defaultPriceId || currentPlanId === defaultPriceId) ? (
                        'ACCÈS ACTIVÉ ✓'
                      ) : (
                        'ACTIVER L\'ACCÈS'
                      )}
                    </button>
                  ) : (
                         <button
                        onClick={handleLoginToSubscribe}
                         className="group relative w-full py-4 px-8 rounded-2xl font-bold text-lg overflow-hidden transition-transform duration-300 hover:scale-[1.07]"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
                        color: 'white',
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 4px 15px rgba(59, 130, 246, 0.4)'
                      }}
                        >
                          <span className="button-glow"></span>
                          CONNEXION REQUISE
                      </button>
                  )}
                  
                  {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-600 text-sm font-mono tracking-wider">
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
          <h3 className="mb-12 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-600" style={{
            textShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}>
            SYSTÈME DE PROTECTION AVANCÉ
          </h3>
          
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
                <div className="mb-4 text-4xl">🔐</div>
                 <h4 className="mb-3 font-bold text-blue-600 text-xl tracking-wider">DONNÉES CHIFFRÉES</h4>
                <p className="text-sm text-gray-600 font-mono tracking-wider">Paiement protégé par Stripe</p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
                <div className="mb-4 text-4xl">📞</div>
                <h4 className="mb-3 font-bold text-amber-600 text-lg tracking-wider">SUPPORT 24/7</h4>
                <p className="text-sm text-gray-600">Notre équipe est là pour vous aider</p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 shadow-2xl">
                <div className="mb-4 text-4xl">🎓</div>
                <h4 className="mb-3 font-bold text-green-600 text-lg tracking-wider">CONTENU PREMIUM</h4>
                <p className="text-sm text-gray-600 font-mono tracking-wider">Cours créés par des experts</p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
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
