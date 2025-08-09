'use client';

import Image from 'next/image';
import { useState } from 'react';

interface EzioProfileProps {
  className?: string;
}

export function EzioProfile({ className = '' }: EzioProfileProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 ${className}`}>
      {!imageError ? (
        <Image
          src="/images/team/ezio-wassim-h.jpg"
          alt="Ezio Wassim H. - Fondateur & CEO"
          width={128}
          height={128}
          className="object-cover w-full h-full"
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-600 dark:text-gray-300">E</span>
        </div>
      )}
    </div>
  );
} 