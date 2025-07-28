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
      const { data, error, count } = await getEnrolledCourses(user.id, params);
      
      if (error) {
        setError(error);
      } else {
        setCourses(data);
        setTotalCount(count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrolled courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Update parameters with partial new params
  const updateParams = (newParams: Partial<EnrolledCoursesParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Fetch courses when params change or user changes
  useEffect(() => {
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