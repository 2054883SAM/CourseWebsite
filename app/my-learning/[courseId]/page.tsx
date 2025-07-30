'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import VideoPlayerClient from '@/app/video-player/video-player-client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = params.courseId as string;

  useEffect(() => {
    async function fetchCourse() {
      // Wait for auth to be ready
      if (authLoading) return;
      
      // Redirect if not authenticated
      if (!user) {
        router.replace('/unauthorized?requiredRole=student');
        return;
      }

      try {
        setLoading(true);
        const result = await getEnrolledCourse(user.id, courseId);
        
        if (result.error || !result.data) {
          setError(result.error || 'Course not found');
          // Redirect to unauthorized page if not enrolled
          router.replace('/unauthorized?requiredRole=student');
          return;
        }
        
        setCourseData(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
          <h2 className="mb-4 text-xl font-semibold text-red-800 dark:text-red-400">Error</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  // Render the video player with the course data
  return (
    <VideoPlayerClient
      playbackId={courseData.playbackId || ''}
      courseId={courseData.id}
      courseTitle={courseData.title}
    />
  );
} 