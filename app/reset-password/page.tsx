import { ResetPassword } from '@/components/auth/ResetPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe - EzioAcademy',
  description: 'Réinitialisez votre mot de passe pour accéder à votre compte',
};

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden background-beige py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-amber-300 rounded-full"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-orange-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-yellow-300 rounded-full"></div>
      </div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPassword />
      </div>
    </div>
  );
}
