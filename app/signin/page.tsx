import { SignIn } from '@/components/auth/SignIn';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Course Website',
  description: 'Sign in to your account to access your courses',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SignIn />
    </div>
  );
}
