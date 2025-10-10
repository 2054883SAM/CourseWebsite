'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // First check if email exists in database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userError || !user) {
        setError('Aucun compte trouvé avec cette adresse e-mail.');
        return;
      }

      // If email exists, send reset password email
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-amber-200/50 bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm">
      {/* Header with Icon */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl">
          <span className="text-3xl">🔐</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Réinitialiser le mot de passe
        </h1>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto"></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">❌</span>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <p className="text-green-800 font-medium">
              Vérifiez votre e-mail pour les instructions de réinitialisation du mot de passe.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="votre@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </div>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      )}

      {/* Back to Sign In */}
      <div className="mt-6 text-center">
        <Link
          href="/signin"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          ← Retour à la connexion
        </Link>
      </div>

      {/* Help Message */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
        <div className="text-center">
          <span className="text-2xl mb-2 block">💡</span>
          <p className="text-sm font-medium text-blue-800">
            Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
          </p>
        </div>
      </div>
    </div>
  );
}
