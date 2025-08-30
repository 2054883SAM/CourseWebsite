'use client';

import { useState } from 'react';

interface NewsletterProps {
  title?: string;
  description?: string;
  className?: string;
}

export function Newsletter({
  title = 'Abonnez-vous à notre newsletter',
  description = 'Recevez les dernières mises à jour et actualités directement dans votre boîte mail.',
  className = '',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formId = 'newsletter-form';
  const inputId = 'newsletter-email';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // This is a mock submission - in a real app, you would send this to your API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate success
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${className}`} role="region" aria-labelledby="newsletter-heading">
      <h3 id="newsletter-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4" id="newsletter-description">
        {description}
      </p>
      
      {isSuccess ? (
        <div 
          className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md text-sm"
          role="status"
          aria-live="polite"
        >
          Merci pour votre abonnement ! Nous vous avons envoyé un e-mail de confirmation.
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit} 
          className="space-y-3"
          id={formId}
          aria-describedby="newsletter-description"
        >
          <div>
            <label htmlFor={inputId} className="sr-only">
              Adresse e-mail
            </label>
            <input
              id={inputId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Entrez votre adresse e-mail"
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
            />
          </div>
          {error && (
            <div 
              className="text-red-600 dark:text-red-400 text-sm" 
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Abonnement en cours...' : 'S\'abonner'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 