'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EnrolledCourse } from '@/lib/supabase/learning';
import ProgressBar from '@/components/ui/ProgressBar';

interface CourseCardProps {
  viewMode: 'grid' | 'list';
  course?: EnrolledCourse;
}

export default function CourseCard({
  viewMode,
  course = {
    id: 'demo-course',
    title: 'Introduction à React et Next.js',
    description:
      'Apprenez les fondamentaux de React et Next.js pour développer des applications web modernes et performantes.',
    thumbnail_url: '/images/placeholders/course-thumbnail.jpg',
    creator_id: 'demo',
    created_at: '2025-06-01',
    lastAccessedAt: '2025-07-20',
    enrollment: {
      id: 'demo-enrollment',
      status: 'active' as const,
      enrolled_at: '2025-06-10',
      progress: 85,
    },
  },
}: CourseCardProps) {
  // Calculate formatted date string
  const lastAccessedDate = course.lastAccessedAt
    ? new Date(course.lastAccessedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Use thumbnail_url if available, otherwise use placeholder
  const thumbnail = course.thumbnail_url || '/images/placeholders/course-thumbnail.jpg';

  // Link to the course player page for enrolled courses
  const courseLink = `/my-learning/${course.id}`;
  const progress = (course as any)?.enrollment?.progress ?? (course as any)?.progress ?? 0;

  return viewMode === 'grid' ? (
    // Grid view
    <div className="group flex flex-col overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:bg-white">
      <Link href={courseLink} className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 backdrop-blur-sm p-4 shadow-xl transition-transform duration-300 group-hover:scale-110 border border-white/20">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={courseLink}>
          <h3 className="line-clamp-2 font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 text-lg">
            {course.title}
          </h3>
        </Link>
        <p className="mt-3 line-clamp-2 text-sm text-gray-600 leading-relaxed">
          {course.description}
        </p>
        <div className="mt-4">
          <ProgressBar value={progress} />
        </div>
        {lastAccessedDate && (
          <p className="mt-3 text-xs text-gray-500 font-medium">
            Dernier accès le {lastAccessedDate}
          </p>
        )}
      </div>
    </div>
  ) : (
    // List view
    <div className="group flex overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:bg-white">
      <Link href={courseLink} className="relative h-auto w-48 overflow-hidden">
        <Image
          src={thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-all duration-300 group-hover:scale-105"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 backdrop-blur-sm p-3 shadow-xl transition-transform duration-300 group-hover:scale-110 border border-white/20">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <Link href={courseLink}>
            <h3 className="font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 text-lg">
              {course.title}
            </h3>
          </Link>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{course.description}</p>
        </div>
        <div className="mt-4">
          <ProgressBar value={progress} />
          {lastAccessedDate && (
            <p className="mt-3 text-xs text-gray-500 font-medium">
              Dernier accès le {lastAccessedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
