import { ResetPassword } from '@/components/auth/ResetPassword';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Course Website',
  description: 'Reset your password to regain access to your account',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <ResetPassword />
    </div>
  );
}
