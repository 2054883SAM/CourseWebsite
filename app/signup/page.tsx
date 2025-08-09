import { SignUp } from '@/components/auth/SignUp';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - EzioAcademy',
  description: 'Create a new account to start learning',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SignUp />
    </div>
  );
}
