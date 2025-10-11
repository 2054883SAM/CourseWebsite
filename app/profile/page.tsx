import UserProfile from '@/components/profile/UserProfile';
import { PageLayout } from '@/components/layout/PageLayout';

// This page depends on authenticated client state; ensure dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="min-h-screen background-beige relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-300/40 via-amber-200/30 to-orange-400/40 animate-gradient-shift"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <PageLayout className="relative z-10">
        <UserProfile />
      </PageLayout>
    </div>
  );
}
