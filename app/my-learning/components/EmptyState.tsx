'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mx-auto max-w-md">
        <div className="relative mx-auto h-52 w-52">
          <Image
            src="/images/placeholders/empty-courses.svg"
            alt="Aucun cours"
            fill
            className="object-contain"
          />
        </div>
        <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
          Aucune formation inscrite
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Vous n'êtes inscrit à aucune formation pour le moment. Découvrez notre catalogue et commencez votre parcours d'apprentissage dès aujourd'hui !
        </p>
        <div className="mt-6">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Explorer les formations
          </Link>
        </div>
      </div>
    </div>
  );
} 