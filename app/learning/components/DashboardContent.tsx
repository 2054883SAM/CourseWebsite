'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEnrolledCourses } from '@/app/my-learning/hooks/useEnrolledCourses';
import ProgressBar from '@/components/ui/ProgressBar';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function DashboardContent() {
  const { user, dbUser } = useAuth();
  const router = useRouter();
  const { courses, isLoading, totalCount } = useEnrolledCourses({
    limit: 3,
    sortBy: 'lastAccessed',
    sortOrder: 'desc',
  });

  // Step 1: Weekly watch time (sum of watch_time_events in last 7 days)
  const [weeklyWatchSeconds, setWeeklyWatchSeconds] = useState<number>(0);
  const [completedQuizzesCount, setCompletedQuizzesCount] = useState<number>(0);
  const [inProgressCoursesCount, setInProgressCoursesCount] = useState<number>(0);

  useEffect(() => {
    const fetchWeeklyWatchTime = async () => {
      if (!user?.id) return;
      try {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const { data, error } = await supabase
          .from('watch_time_events')
          .select('seconds_watched, occurred_at')
          .eq('user_id', user.id)
          .gte('occurred_at', weekAgo.toISOString())
          .lte('occurred_at', now.toISOString());

        if (error) {
          console.error('Failed to load weekly watch time:', error);
          setWeeklyWatchSeconds(0);
          return;
        }

        const total = (data || []).reduce(
          (sum: number, row: any) => sum + Number(row.seconds_watched || 0),
          0
        );
        setWeeklyWatchSeconds(total);
      } catch (e) {
        console.error('Error computing weekly watch time:', e);
        setWeeklyWatchSeconds(0);
      }
    };

    fetchWeeklyWatchTime();
  }, [user?.id]);

  // Step 2: Total quizzes completed (count of section_progress.completed = true)
  // Step 3: Courses in progress count (enrollments with progress > 0 and status active)
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) return;
      try {
        const [quizzesRes, coursesRes] = await Promise.all([
          supabase
            .from('section_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('quiz_score', 70),
          supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gt('progress', 0),
        ]);

        if (quizzesRes.error) {
          console.error('Failed to count completed quizzes:', quizzesRes.error);
          setCompletedQuizzesCount(0);
        } else {
          setCompletedQuizzesCount(quizzesRes.count ?? 0);
        }

        if (coursesRes.error) {
          console.error('Failed to count in-progress courses:', coursesRes.error);
          setInProgressCoursesCount(0);
        } else {
          setInProgressCoursesCount(coursesRes.count ?? 0);
        }
      } catch (e) {
        console.error('Error fetching stats counts:', e);
        setCompletedQuizzesCount(0);
        setInProgressCoursesCount(0);
      }
    };

    fetchCounts();
  }, [user?.id]);

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau De Bord</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Bienvenue {dbUser?.name}, voici un aperçu de vos activités d&apos;apprentissage
        </p>
      </div>

      {/* Recent courses section */}
      <div className="rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-5 w-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Cours récents
          </h2>
          <Link
            href="/learning?page=my-learning"
            onClick={(e) => {
              e.preventDefault();
              router.push('/learning?page=my-learning');
            }}
            className="transform text-sm font-medium text-orange-600 transition-colors duration-300 hover:scale-105 hover:text-orange-800 dark:text-orange-400"
          >
            Voir tout ({totalCount})
            <svg
              className="ml-1 inline h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
                className="group flex items-center rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50/30 to-gray-100/30 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-orange-200/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 hover:shadow-lg dark:border-gray-600/50 dark:from-gray-700/30 dark:to-gray-600/30 dark:hover:border-orange-800/50 dark:hover:from-orange-900/10 dark:hover:to-amber-900/10"
              >
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-md transition-shadow duration-300 group-hover:shadow-lg dark:bg-gray-700">
                  {course.thumbnail_url ? (
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <span className="text-2xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                    {course.title}
                  </h3>
                  <div className="mt-2">
                    <ProgressBar value={course.enrollment.progress || 0} />
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Learning Statistics - Full Width */}
      <div className="rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90">
        <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
          <svg
            className="mr-2 h-5 w-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Statistiques d&apos;apprentissage
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* <div className="flex items-center justify-between rounded-lg border border-orange-200/30 bg-gradient-to-r from-orange-50/50 to-amber-50/50 p-3 dark:border-orange-800/30 dark:from-orange-900/10 dark:to-amber-900/10">
            <div className="flex items-center">
              <svg
                className="mr-2 h-4 w-4 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Temps d&apos;apprentissage cette semaine
              </span>
            </div>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatDuration(weeklyWatchSeconds)}
            </span>
          </div> */}
          <div className="flex items-center justify-between rounded-lg border border-green-200/30 bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-3 dark:border-green-800/30 dark:from-green-900/10 dark:to-emerald-900/10">
            <div className="flex items-center">
              <svg
                className="mr-2 h-4 w-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">Quiz complétés</span>
            </div>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {completedQuizzesCount}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-3 dark:border-blue-800/30 dark:from-blue-900/10 dark:to-indigo-900/10">
            <div className="flex items-center">
              <svg
                className="mr-2 h-4 w-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">Cours en cours</span>
            </div>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {inProgressCoursesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
