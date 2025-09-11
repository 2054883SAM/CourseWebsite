'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setError(null);
      setLoading(true);

      // Create subscription checkout session
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
    <div className="min-h-screen w-full bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header de la page */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre abonnement
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accédez à tous nos cours premium et donnez à votre enfant les meilleures chances de réussite
          </p>
        </div>

        {/* Container pour les cartes de pricing (préparé pour plusieurs cartes) */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            {/* Carte d'abonnement moderne */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform hover:shadow-3xl transition-shadow duration-300 mt-6">
              {/* Badge "Populaire" */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Le plus populaire
                </div>
              </div>

              {/* Header de la carte */}
              <div className="pt-12 pb-8 px-10 text-center border-b border-gray-100">
                <h3 className="text-3xl font-bold text-[#1D4ED8] mb-3">Premium</h3>
                <p className="text-gray-600 mb-8 text-lg">Accès complet à tous les cours</p>
                
                {/* Prix avec ancien prix barré */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-lg text-gray-500 line-through">$70</span>
                    <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-semibold">-29%</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-black text-[#1D4ED8]">$50</span>
                    <span className="text-xl text-gray-600 font-medium">/mois</span>
                  </div>
                </div>
              </div>

              {/* Liste des avantages */}
              <div className="px-10 py-8">
                <ul className="space-y-5">
                  <li className="flex items-center gap-4">
                    <span className="text-green-500 text-2xl">✅</span>
                    <span className="text-gray-700 font-semibold text-lg">Accès illimité à tous les cours</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-blue-500 text-2xl">📘</span>
                    <span className="text-gray-700 font-semibold text-lg">Nouveau contenu ajouté chaque mois</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-blue-500 text-2xl">🔒</span>
                    <span className="text-gray-700 font-semibold text-lg">Accès sécurisé et paiement Stripe</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-green-500 text-2xl">❌</span>
                    <span className="text-gray-700 font-semibold text-lg">Annulable à tout moment</span>
                  </li>
                </ul>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mx-10 mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-center text-sm">
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
                    className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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
                    className="w-full bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🔐</span>
                      <span>Se connecter pour s'abonner</span>
                    </div>
                  </button>
                )}

                {/* Texte sous le bouton */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  Annulation possible à tout moment. Paiement sécurisé.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section d'informations supplémentaires */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">💳</div>
              <h4 className="font-semibold text-gray-900 mb-2">Paiement sécurisé</h4>
              <p className="text-sm text-gray-600">Vos données sont protégées par Stripe</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📞</div>
              <h4 className="font-semibold text-gray-900 mb-2">Support 24/7</h4>
              <p className="text-sm text-gray-600">Notre équipe est là pour vous aider</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🎓</div>
              <h4 className="font-semibold text-gray-900 mb-2">Contenu premium</h4>
              <p className="text-sm text-gray-600">Cours créés par des experts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


