'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {trend && (
            <p
              className={`mt-1 text-sm ${
                trend.positive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, children }: ChartCardProps) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
};

export default function DashboardContent() {
  const router = useRouter();
  const [recentEnrollmentProgress, setRecentEnrollmentProgress] = useState<
    { id: string; courseId: string; courseTitle: string; progress: number }[]
  >([]);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(true);

  // Placeholder data - would be fetched from API in a real implementation
  const stats = [
    {
      title: "Total d'utilisateurs",
      value: '2,543',
      trend: { value: '12% ce mois', positive: true },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Cours publiés',
      value: '42',
      trend: { value: '3 nouveaux', positive: true },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      title: 'Inscriptions',
      value: '1,286',
      trend: { value: '8% ce mois', positive: true },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      title: 'Revenus mensuels',
      value: '8,650 €',
      trend: { value: '5% ce mois', positive: false },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // Placeholder for recent activities
  const recentActivities = [
    {
      id: 1,
      user: 'Thomas Dupont',
      action: "s'est inscrit à",
      target: 'Développement React Avancé',
      time: 'Il y a 2 heures',
    },
    {
      id: 2,
      user: 'Marie Leroy',
      action: 'a terminé',
      target: 'Introduction à Node.js',
      time: 'Il y a 3 heures',
    },
    {
      id: 3,
      user: 'Alexandre Martin',
      action: 'a publié un nouveau cours',
      target: 'Design Patterns en Java',
      time: 'Il y a 5 heures',
    },
    {
      id: 4,
      user: 'Sophie Bernard',
      action: 'a mis à jour',
      target: 'Fondamentaux de TypeScript',
      time: 'Il y a 8 heures',
    },
    {
      id: 5,
      user: 'Lucas Petit',
      action: 'a ajouté une nouvelle section à',
      target: 'Python pour la Data Science',
      time: 'Hier',
    },
  ];

  // Fetch recent enrollments with progress directly from enrollments table
  useEffect(() => {
    const fetchRecentProgress = async () => {
      try {
        const supabase = createBrowserClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from('enrollments')
          .select(
            `
            id,
            progress,
            course:course_id (
              id,
              title
            )
          `
          )
          .eq('status', 'active')
          .order('enrolled_at', { ascending: false })
          .limit(5);

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch enrollments progress:', error);
          setRecentEnrollmentProgress([]);
        } else {
          const list = (data || []).map((row: any) => ({
            id: row.id as string,
            courseId: (Array.isArray(row.course) ? row.course[0]?.id : row.course?.id) as string,
            courseTitle: (Array.isArray(row.course)
              ? row.course[0]?.title
              : row.course?.title) as string,
            progress: Number(row.progress ?? 0),
          }));
          setRecentEnrollmentProgress(list);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Unexpected error fetching enrollments progress:', e);
        setRecentEnrollmentProgress([]);
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchRecentProgress();
  }, []);

  return (
    <div className="px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tableau de bord administrateur
        </h1>
        <button
          onClick={() => router.push('/create-video')}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Créer une vidéo
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Course Completion Chart */}
        <ChartCard title="Taux de complétion des cours">
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Graphique de taux de complétion des cours
            </p>
          </div>
        </ChartCard>

        {/* Monthly Enrollments */}
        <ChartCard title="Inscriptions mensuelles">
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Graphique des inscriptions mensuelles
            </p>
          </div>
        </ChartCard>

        {/* Revenue Chart */}
        <ChartCard title="Revenus">
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Graphique de revenus</p>
          </div>
        </ChartCard>
      </div>

      {/* Recent Enrollment Progress (from enrollments.progress) */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Progression des cours (dernières inscriptions)
        </h3>
        {loadingProgress ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : recentEnrollmentProgress.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune inscription récente.</p>
        ) : (
          <div className="space-y-4">
            {recentEnrollmentProgress.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {item.courseTitle}
                  </p>
                </div>
                <div className="flex w-1/2 items-center">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                    <div
                      className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                      style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                    />
                  </div>
                  <span className="ml-2 w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(item.progress)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Activité récente
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <div className="flex h-full w-full items-center justify-center font-medium">
                    {activity.user.substring(0, 1)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user} {activity.action}{' '}
                    <span className="font-semibold">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
              <button className="rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20">
                Voir
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
