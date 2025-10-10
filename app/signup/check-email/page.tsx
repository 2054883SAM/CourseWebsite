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
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden background-beige py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-amber-300 rounded-full"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-orange-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-yellow-300 rounded-full"></div>
      </div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-3xl border-2 border-amber-200/50 bg-white/95 px-8 py-10 shadow-2xl backdrop-blur-sm">
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-xl">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vérifiez votre e-mail
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"></div>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700 mb-6">
              Nous vous avons envoyé un lien de confirmation{email ? ` à ${email}` : ''}. 
              <span className="font-semibold text-gray-900">Cliquez sur le lien dans cet e-mail pour activer votre compte.</span>
            </p>
            
            {/* Info Cards */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <span className="text-2xl mr-3">📬</span>
                <span className="text-gray-700 font-medium">Vérifiez votre dossier Courrier indésirable/Spam</span>
              </div>
              <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
                <span className="text-2xl mr-3">⏰</span>
                <span className="text-gray-700 font-medium">Le lien expire après un certain temps, utilisez-le rapidement</span>
              </div>
              <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                <span className="text-2xl mr-3">🔄</span>
                <span className="text-gray-700 font-medium">Vous pouvez renvoyer le lien depuis la page de connexion</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signin"
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white text-center transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
            >
              Se connecter
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl border-2 border-gray-300 px-6 py-3 text-gray-800 text-center font-medium transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg"
            >
              Retour à l'accueil
            </Link>
          </div>

          {/* Encouragement Message */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🌟</span>
              <p className="text-sm font-medium text-amber-800">
                Votre aventure d'apprentissage commence bientôt !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
