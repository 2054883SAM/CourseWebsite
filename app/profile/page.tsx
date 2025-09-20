import UserProfile from '@/components/profile/UserProfile';
import { PageLayout } from '@/components/layout/PageLayout';

// This page depends on authenticated client state; ensure dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <PageLayout>
      <UserProfile />
    </PageLayout>
  );
}
