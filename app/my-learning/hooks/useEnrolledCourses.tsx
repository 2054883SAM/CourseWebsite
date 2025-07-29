'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getEnrolledCourses, EnrolledCourse, EnrolledCoursesParams } from '@/lib/supabase/learning';

interface UseEnrolledCoursesResult {
  courses: EnrolledCourse[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  setParams: (newParams: Partial<EnrolledCoursesParams>) => void;
}

/**
 * Custom hook for fetching enrolled courses with sorting, filtering, and pagination
 */
export function useEnrolledCourses(
  initialParams: EnrolledCoursesParams = {}
): UseEnrolledCoursesResult {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [params, setParams] = useState<EnrolledCoursesParams>(initialParams);

  // Fetch courses with the current parameters
  const fetchCourses = async () => {
    if (!user?.id) {
      setIsLoading(false);
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`useEnrolledCourses: Fetching for user ${user.id} with params:`, params);
      const { data, error, count } = await getEnrolledCourses(user.id, params);
      
      if (error) {
        console.error('useEnrolledCourses: Error fetching courses:', error);
        setError(error);
      } else {
        console.log(`useEnrolledCourses: Fetched ${data.length} courses`);
        setCourses(data);
        setTotalCount(count);
      }
    } catch (err: any) {
      console.error('useEnrolledCourses: Exception during fetch:', err);
      setError(err.message || 'Failed to fetch enrolled courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Update parameters with partial new params
  const updateParams = (newParams: Partial<EnrolledCoursesParams>) => {
    console.log('useEnrolledCourses: Updating params:', newParams);
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Fetch courses when params change or user changes
  useEffect(() => {
    console.log('useEnrolledCourses: Effect triggered, user ID:', user?.id);
    fetchCourses();
  }, [
    user?.id,
    params.limit,
    params.offset,
    params.sortBy,
    params.sortOrder,
    params.status
  ]);

  return {
    courses,
    isLoading,
    error,
    totalCount,
    refetch: fetchCourses,
    setParams: updateParams
  };
} 