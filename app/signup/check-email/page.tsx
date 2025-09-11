import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vérifiez votre e-mail - EzioAcademy',
  description: 'Confirmez votre e-mail pour activer votre compte',
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = '' } = await searchParams;
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 py-12 dark:from-blue-900 dark:to-blue-800 sm:px-6 lg:px-8">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-blue-200/50 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur-sm dark:border-blue-700/50 dark:bg-gray-800/90">
          <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Vérifiez votre e-mail
          </h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Nous vous avons envoyé un lien de confirmation{email ? ` à ${email}` : ''}. Cliquez sur
            le lien dans cet e-mail pour activer votre compte.
          </p>
          <ul className="mb-6 list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400">
            <li>Vérifiez votre dossier Courrier indésirable/Spam</li>
            <li>Le lien expire après un certain temps, utilisez-le rapidement</li>
            <li>
              Si vous n&#39;avez rien reçu, vous pouvez renvoyer le lien depuis la page de connexion
            </li>
          </ul>
          <div className="flex gap-3">
            <Link
              href="/signin"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Se connecter
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Retour à l&#39;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
