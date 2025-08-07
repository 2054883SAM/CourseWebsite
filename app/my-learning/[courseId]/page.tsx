'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourse } from '@/lib/supabase/learning';
import VdoCipherPlayer from '@/components/video/VdoCipherPlayer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const courseId = params.courseId as string;

  useEffect(() => {
    // Prevent fetching course data multiple times
    if (hasFetchedRef.current || courseData) return;

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
        
        // Try to get data from session storage first
        try {
          const cachedData = sessionStorage.getItem(`course_${courseId}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            console.log('Using cached course data');
            setCourseData(parsedData);
            hasFetchedRef.current = true;
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to read from session storage:', e);
          // Continue with API fetch if session storage fails
        }
        
        // If no cached data, fetch from API
        console.log('Fetching course data from API');
        const result = await getEnrolledCourse(user.id, courseId);

        if (result.error || !result.data) {
          setError(result.error || 'Course not found');
          // Redirect to unauthorized page if not enrolled
          router.replace('/unauthorized?requiredRole=student');
          return;
        }

        // Cache the result in session storage
        try {
          sessionStorage.setItem(`course_${courseId}`, JSON.stringify(result.data));
        } catch (e) {
          console.warn('Failed to cache course data:', e);
        }

        // Mark as fetched and update state
        hasFetchedRef.current = true;
        setCourseData(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, user, authLoading, router, courseData]);

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

  // Render the VdoCipher video player with the course data
  return (
    <div className="flex flex-col gap-4">
    <VdoCipherPlayer
      videoId={courseData.playbackId || ''}
      watermark={user?.email}
      chapters={courseData.chapters || []}
      className="w-full"
      userId={user?.id}
      courseId={courseId}
      duration={courseData.duration}
    />
    </div>
  );
}
