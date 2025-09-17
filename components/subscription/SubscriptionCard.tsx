'use client';

import { useState } from 'react';

interface SubscriptionCardProps {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  features: string[];
  isCurrent?: boolean;
  onSubscribe: () => void;
  onLoginToSubscribe: () => void;
  loading?: boolean;
  error?: string | null;
  user?: any;
  badge?: string;
}

export function SubscriptionCard({
  title,
  description,
  price,
  originalPrice,
  discount,
  features,
  isCurrent = false,
  onSubscribe,
  onLoginToSubscribe,
  loading = false,
  error = null,
  user,
  badge = "Le plus populaire"
}: SubscriptionCardProps) {
  return (
    <div className={`relative mt-6 transform overflow-hidden rounded-3xl border transition-all duration-300 ${
      isCurrent 
        ? 'border-4 border-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-2xl shadow-green-300/60 ring-2 ring-green-200/50' 
        : 'border border-gray-200 bg-white hover:shadow-3xl shadow-2xl'
    }`}>
      {/* Badge principal */}
      {!isCurrent && (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 text-sm font-bold text-white shadow-lg">
            ⭐ {badge}
          </div>
        </div>
      )}

      {/* Ruban "Abonnement actuel" */}
      {isCurrent && (
        <div className="absolute -top-1 left-0 right-0 z-20">
          <div className="relative">
            {/* Ruban principal */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white text-center py-3 px-6 shadow-xl">
              <span className="text-sm font-bold flex items-center justify-center gap-2">
                <span className="text-lg animate-pulse">✅</span>
                <span>Abonnement actuel</span>
              </span>
            </div>
            {/* Effet de ruban avec coins coupés */}
            <div className="absolute top-0 left-0 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-blue-600"></div>
            <div className="absolute top-0 right-0 w-0 h-0 border-r-8 border-r-transparent border-t-8 border-t-blue-800"></div>
            {/* Ombre portée du ruban */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900/20"></div>
          </div>
        </div>
      )}

      {/* Header de la carte */}
      <div className={`border-b px-10 pb-8 text-center ${
        isCurrent ? 'border-green-200 pt-16' : 'border-gray-100 pt-12'
      }`}>
        <h3 className={`mb-3 text-3xl font-bold ${
          isCurrent ? 'text-green-800' : 'text-[#1D4ED8]'
        }`}>
          {title}
        </h3>
        <p className={`mb-8 text-lg ${
          isCurrent ? 'text-green-700' : 'text-gray-600'
        }`}>
          {description}
        </p>

        {/* Prix avec ancien prix barré */}
        <div className="mb-6">
          {originalPrice && discount && (
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="text-lg text-gray-500 line-through">${originalPrice}</span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                -{discount}%
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-6xl font-black ${
              isCurrent ? 'text-green-800' : 'text-[#1D4ED8]'
            }`}>
              ${price}
            </span>
            <span className={`text-xl font-medium ${
              isCurrent ? 'text-green-700' : 'text-gray-600'
            }`}>
              /mois
            </span>
          </div>
        </div>
      </div>

      {/* Liste des avantages */}
      <div className="px-10 py-8">
        <ul className="space-y-5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-4">
              <span className="text-2xl text-green-500">✅</span>
              <span className={`text-lg font-semibold ${
                isCurrent ? 'text-green-800' : 'text-gray-700'
              }`}>
                {feature}
              </span>
            </li>
          ))}
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
            onClick={isCurrent ? undefined : onSubscribe}
            disabled={loading || isCurrent}
            className={`w-full transform rounded-2xl px-8 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 ${
              isCurrent
                ? 'bg-gray-400 cursor-not-allowed opacity-70 hover:opacity-70'
                : 'bg-[#1D4ED8] hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Redirection vers Stripe...</span>
              </div>
            ) : isCurrent ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">✅</span>
                <span>Déjà abonné</span>
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
            onClick={onLoginToSubscribe}
            className="w-full transform rounded-2xl bg-[#1D4ED8] px-8 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              <span>🔐</span>
              <span>Se connecter pour s'abonner</span>
            </div>
          </button>
        )}

        {/* Texte sous le bouton */}
        <p className={`mt-6 text-center text-sm ${
          isCurrent ? 'text-green-600 font-medium' : 'text-gray-500'
        }`}>
          {isCurrent 
            ? 'Vous profitez déjà de cet abonnement' 
            : 'Annulation possible à tout moment. Paiement sécurisé.'
          }
        </p>
      </div>
    </div>
  );
}
