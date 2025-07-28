'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EnrolledCourse } from '@/lib/supabase/learning';

interface CourseCardProps {
  viewMode: 'grid' | 'list';
  course?: EnrolledCourse;
}

export default function CourseCard({ 
  viewMode, 
  course = {
    id: 'demo-course',
    title: 'Introduction à React et Next.js',
    description: 'Apprenez les fondamentaux de React et Next.js pour développer des applications web modernes et performantes.',
    thumbnail_url: '/images/placeholders/course-thumbnail.jpg',
    price: 29.99,
    creator_id: 'demo',
    created_at: '2025-06-01',
    progress: 35,
    lastAccessedAt: '2025-07-20',
    enrollment: {
      id: 'demo-enrollment',
      status: 'active' as const,
      created_at: '2025-06-10'
    }
  }
}: CourseCardProps) {
  // Calculate formatted date string
  const lastAccessedDate = course.lastAccessedAt 
    ? new Date(course.lastAccessedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;
    
  // Use thumbnail_url if available, otherwise use placeholder
  const thumbnail = course.thumbnail_url || '/images/placeholders/course-thumbnail.jpg';

  return viewMode === 'grid' ? (
    // Grid view
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link href={`/courses/${course.id}`} className="aspect-video relative overflow-hidden">
        <Image
          src={thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/courses/${course.id}`}>
          <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {course.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {course.description}
        </p>
        <div className="mt-4 flex items-center">
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full rounded-full bg-green-500" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {course.progress}% terminé
            </p>
          </div>
        </div>
        {lastAccessedDate && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Dernier accès le {lastAccessedDate}
          </p>
        )}
      </div>
    </div>
  ) : (
    // List view
    <div className="group flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link href={`/courses/${course.id}`} className="relative h-auto w-48 overflow-hidden">
        <Image
          src={thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-all duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <Link href={`/courses/${course.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {course.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {course.description}
          </p>
        </div>
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full rounded-full bg-green-500" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {course.progress}% terminé
              </p>
            </div>
            {lastAccessedDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dernier accès le {lastAccessedDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 