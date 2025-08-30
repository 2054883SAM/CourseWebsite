'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
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
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Réinitialiser le mot de passe</h2>
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700" role="alert">
          Vérifiez votre e-mail pour les instructions de réinitialisation du mot de passe.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link
          href="/signin"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
