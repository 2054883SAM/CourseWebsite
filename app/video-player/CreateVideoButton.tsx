import { useRouter } from 'next/navigation';
import React from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { useIsAdmin, useIsCreator } from '@/lib/auth/hooks';

const CreateVideoButton: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { hasRole: isAdmin } = useIsAdmin();
  const { hasRole: isCreator } = useIsCreator();

  if (!user || (!isAdmin && !isCreator)) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      onClick={() => router.push('/create-video')}
    >
      Créer une vidéo
    </button>
  );
};

export default CreateVideoButton; 