'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Course, Section } from '@/lib/supabase/types';
import EnrollButton from '@/components/courses/EnrollButton';
import { useState, useEffect } from 'react';
import { verifyEnrollmentEligibility } from '@/lib/supabase/enrollments';
import { initiateCheckout } from '@/lib/supabase/checkout';
import { loadPaddleJs } from '@/lib/paddle/client';

interface CourseActionsProps {
  course: Course;
  sections: Section[];
}

export function CourseActions({ course, sections }: CourseActionsProps) {
  const { user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollmentStatus, setEnrollmentStatus] = useState<'not-enrolled' | 'processing' | 'enrolled'>('not-enrolled');
  const [isEnrollmentChecked, setIsEnrollmentChecked] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Load Paddle.js when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadPaddleJs();
    }
  }, []);
  
  // Check enrollment eligibility when user or course changes
  useEffect(() => {
    const checkEligibility = async () => {
      if (!course?.id) return;
      
      const { status, message } = await verifyEnrollmentEligibility(
        user?.id,
        dbUser?.role,
        course.id
      );
      
      // Update button state based on eligibility status
      if (status === 'enrolled') {
        setEnrollmentStatus('enrolled');
      } else {
        setEnrollmentStatus('not-enrolled');
      }
      
      // Update tooltip message
      setTooltipMessage(message);
      setIsEnrollmentChecked(true);
    };
    
    if (!authLoading) {
      checkEligibility();
    }
  }, [user, dbUser, course.id, authLoading]);

  const handleEnrollClick = async () => {
    if (!user) {
      // Store the current course URL in session storage for redirect after login
      sessionStorage.setItem('redirectAfterLogin', `/courses/${course.id}`);
      router.push('/signin');
      return;
    }
    
    // Check role eligibility
    if (!dbUser?.role || (dbUser.role !== 'admin' && dbUser.role !== 'creator' && dbUser.role !== 'student')) {
      setErrorMessage('Your account does not have permission to enroll in courses');
      console.error('Your account does not have permission to enroll in courses');
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);
    
    // Set processing state
    setEnrollmentStatus('processing');
    
    try {
      // Initiate checkout using our checkout service
      const result = await initiateCheckout(course.id);
      
      if (result.success) {
        // Successful payment and enrollment
        setEnrollmentStatus('enrolled');
        setTooltipMessage("You're enrolled in this course");
      } else if (result.alreadyEnrolled) {
        // User is already enrolled
        setEnrollmentStatus('enrolled');
        setTooltipMessage("You're already enrolled in this course");
      } else if (result.error?.includes('Authentication required')) {
        // Authentication error, user session might have expired
        console.log('Authentication error detected, redirecting to login');
        
        // Store the current page URL for redirect after login
        const currentUrl = `/courses/${course.id}`;
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
        
        // Redirect to sign-in page
        router.push(`/signin?redirectTo=${encodeURIComponent(currentUrl)}`);
      } else {
        // Handle other checkout errors
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(result.error || 'Failed to complete enrollment');
        setTooltipMessage('Click to try enrolling again');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication required')) {
        console.log('Authentication error detected in catch block, redirecting to login');
        // Store redirect and navigate to login
        const currentUrl = `/courses/${course.id}`;
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
        router.push(`/signin?redirectTo=${encodeURIComponent(currentUrl)}`);
      } else {
        // Handle other errors
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(error.message || 'An error occurred during enrollment');
        setTooltipMessage('Click to try enrolling again');
      }
    }
  };

  // Calculate total duration from sections
  const totalDuration = Math.round(
    sections.reduce((total, section) => total + (section.duration || 0), 0) / 60
  );

  // Don't show anything until enrollment is checked to prevent UI flickering
  if (!isEnrollmentChecked && !authLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="text-2xl font-bold mb-4">${course.price.toFixed(2)}</div>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-700 rounded-md border border-red-200">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="mb-4 w-full">
        <EnrollButton
          status={enrollmentStatus}
          onClick={handleEnrollClick}
          disabled={authLoading || enrollmentStatus === 'enrolled'}
          tooltipText={tooltipMessage}
          className="w-full"
        />
      </div>

      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Sections totales :</span>
          <span className="font-semibold">{sections.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Durée totale :</span>
          <span className="font-semibold">
            {totalDuration} min
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Créé par :</span>
          <span className="font-semibold">{course.creator?.name || 'Inconnu'}</span>
        </div>
        {course.playback_id && (
          <div className="flex justify-between">
            <span className="text-gray-600">Statut vidéo :</span>
            <span className="font-semibold text-green-600">Disponible</span>
          </div>
        )}
      </div>
    </div>
  );
} 