'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        {/* Container pour les cartes de pricing (préparé pour plusieurs cartes) */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            {/* Carte d'abonnement moderne */}
            <div className="hover:shadow-3xl relative mt-6 transform overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl transition-shadow duration-300">
              {/* Badge "Populaire" */}
              <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 text-sm font-bold text-white shadow-lg">
                  ⭐ Le plus populaire
                </div>
              </div>

              {/* Header de la carte */}
              <div className="border-b border-gray-100 px-10 pb-8 pt-12 text-center">
                <h3 className="mb-3 text-3xl font-bold text-[#1D4ED8]">Premium</h3>
                <p className="mb-8 text-lg text-gray-600">Accès complet à tous les cours</p>

                {/* Prix avec ancien prix barré */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <span className="text-lg text-gray-500 line-through">$70</span>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                      -29%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-[#1D4ED8]">$50</span>
                    <span className="text-xl font-medium text-gray-600">/mois</span>
                  </div>
                </div>
              </div>

              {/* Liste des avantages */}
              <div className="px-10 py-8">
                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <span className="text-2xl text-green-500">✅</span>
                    <span className="text-lg font-semibold text-gray-700">
                      Accès illimité à tous les cours
                    </span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl text-blue-500">📘</span>
                    <span className="text-lg font-semibold text-gray-700">
                      Nouveau contenu ajouté chaque mois
                    </span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl text-blue-500">🔒</span>
                    <span className="text-lg font-semibold text-gray-700">
                      Accès sécurisé et paiement Stripe
                    </span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl text-green-500">❌</span>
                    <span className="text-lg font-semibold text-gray-700">
                      Annulable à tout moment
                    </span>
                  </li>
                </ul>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mx-10 mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
                  <span className="font-medium">⚠️ {error}</span>
                </div>
              )}

              {/* Bouton principal */}
              <div className="px-10 pb-10">
                {user ? (
                  // Bouton pour utilisateur connecté
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full transform rounded-2xl bg-[#1D4ED8] px-8 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                        <span>Redirection vers Stripe...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>🚀</span>
                        <span>S'abonner maintenant</span>
                      </div>
                    )}
                  </button>
                ) : (
                  // Bouton pour utilisateur non connecté
                  <button
                    onClick={handleLoginToSubscribe}
                    className="w-full transform rounded-2xl bg-[#1D4ED8] px-8 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🔐</span>
                      <span>Se connecter pour s'abonner</span>
                    </div>
                  </button>
                )}

                {/* Texte sous le bouton */}
                <p className="mt-6 text-center text-sm text-gray-500">
                  Annulation possible à tout moment. Paiement sécurisé.
                </p>
              </div>
            </div>
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
