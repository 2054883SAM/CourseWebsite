'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEnrolledCourses } from '@/app/my-learning/hooks/useEnrolledCourses';

export default function DashboardContent() {
  const { user, dbUser } = useAuth();
  const router = useRouter();
  const { courses, isLoading, totalCount } = useEnrolledCourses({
    limit: 3,
    sortBy: 'lastAccessed',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Bienvenue {dbUser?.name}, voici un aperçu de vos activités d&apos;apprentissage
        </p>
      </div>

      {/* Recent courses section */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cours récents</h2>
          <Link
            href="/learning?page=my-learning"
            onClick={(e) => {
              e.preventDefault();
              router.push('/learning?page=my-learning');
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Voir tout ({totalCount})
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse items-center">
                <div className="h-14 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Vous n&apos;avez pas encore commencé de cours.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Découvrir des cours
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/my-learning/${course.id}`}
                className="flex items-center rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                  {course.thumbnail_url ? (
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <span className="text-xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                  <div className="mt-1 flex items-center">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {course.progress || 0}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Activity overview card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex items-center">
                <span className="mr-2 text-lg">🎉</span>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Bravo ! Vous avez terminé le chapitre 2 du cours &quot;Les fractions&quot;.
                </p>
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
              <div className="flex items-center">
                <span className="mr-2 text-lg">📅</span>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Nouveau quiz disponible dans le cours &quot;Les verbes du premier groupe&quot;.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Statistiques d&apos;apprentissage
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Temps d&apos;apprentissage cette semaine
              </span>
              <span className="font-medium text-gray-900 dark:text-white">2h 15min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Quiz complétés</span>
              <span className="font-medium text-gray-900 dark:text-white">7 / 12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Cours en cours</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended courses section */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cours recommandés</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Explorer tous les cours
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              id: 'rec1',
              title: 'Les additions et soustractions',
              level: 'CE1',
              image: '📐',
            },
            {
              id: 'rec2',
              title: 'Lecture et compréhension',
              level: 'CP',
              image: '📚',
            },
            {
              id: 'rec3',
              title: 'Les sciences naturelles',
              level: 'CE2',
              image: '🔬',
            },
          ].map((rec) => (
            <Link
              key={rec.id}
              href={`/courses/${rec.id}`}
              className="flex flex-col rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl dark:bg-blue-900/30">
                {rec.image}
              </div>
              <h3 className="mb-1 font-medium text-gray-900 dark:text-white">{rec.title}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">Niveau: {rec.level}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
