import { SignIn } from '@/components/auth/SignIn';
import { Metadata } from 'next';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Connexion - EduKidz',
  description: 'Connectez-vous à votre compte pour accéder à vos cours',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-300/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <Logo className="text-6xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenue sur EduKidz
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte pour accéder à vos cours
          </p>
        </div>

        {/* Sign in form */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-blue-200/50 dark:border-blue-700/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SignIn />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 EduKidz. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
