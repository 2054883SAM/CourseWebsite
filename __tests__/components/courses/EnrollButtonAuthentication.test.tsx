import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/lib/auth/hooks';
import { CourseActions } from '@/app/courses/[id]/components/CourseActions';
import { verifyEnrollmentEligibility } from '@/lib/supabase/enrollments';
import { Course, Section } from '@/lib/supabase/types';

// Mock the auth hooks
jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn(),
}));

// Mock the enrollment verification
jest.mock('@/lib/supabase/enrollments', () => ({
  verifyEnrollmentEligibility: jest.fn(),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('EnrollButton Authentication Integration', () => {
  const mockCourse: Course = {
    id: 'course-1',
    title: 'Test Course',
    description: 'Test Description',
    thumbnail_url: '/test.jpg',
    // price removed
    creator_id: 'creator-1',
    created_at: '2023-01-01',
    creator: { 
      id: 'creator-1', 
      name: 'Test Creator', 
      email: 'creator@test.com',
      role: 'teacher',
      created_at: '2023-01-01'
    },
  };

  const mockSections: Section[] = [
    { 
      id: 'section-1', 
      title: 'Section 1', 
      course_id: 'course-1',
      order: 1,
      duration: 600, // 10 minutes
    }
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default auth mock
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      dbUser: null,
      loading: false,
    });
    
    // Default enrollment verification mock
    (verifyEnrollmentEligibility as jest.Mock).mockResolvedValue({
      canEnroll: false,
      status: 'unauthenticated',
      message: 'You need to sign in to enroll in this course',
    });
    
    // Mock window.sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('shows loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      dbUser: null,
      loading: true,
    });

    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Check loading state
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('redirects to signin page when unauthenticated user clicks enroll', async () => {
    const mockSessionStorage = window.sessionStorage as jest.Mocked<Storage>;
    
    render(<CourseActions course={mockCourse} sections={mockSections} />);

    // Click the enroll button
    fireEvent.click(screen.getByRole('button'));

    // Verify redirect URL was saved to session storage
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'redirectAfterLogin',
      `/courses/${mockCourse.id}`
    );
  });

  it('shows enrolled state for already enrolled users', async () => {
    // Mock authenticated user who is already enrolled
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      dbUser: { id: 'user-1', role: 'student' },
      loading: false,
    });
    
    // Mock enrolled status
    (verifyEnrollmentEligibility as jest.Mock).mockResolvedValue({
      canEnroll: false,
      status: 'enrolled',
      message: "You're already enrolled in this course",
    });

    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for enrollment check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalledWith(
        'user-1',
        'student',
        'course-1'
      );
    });
    
    // Check that button shows enrolled state
    expect(screen.getByText('Enrolled')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows processing state during enrollment', async () => {
    // Mock authenticated student user
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      dbUser: { id: 'user-1', role: 'student' },
      loading: false,
    });
    
    // Mock eligible to enroll
    (verifyEnrollmentEligibility as jest.Mock).mockResolvedValue({
      canEnroll: true,
      status: 'eligible',
      message: 'Click to enroll in this course',
    });
    
    // Mock setTimeout
    jest.useFakeTimers();

    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for enrollment check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that button shows processing state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Fast-forward through the setTimeout
    jest.runAllTimers();
    
    // Check that button shows enrolled state after processing
    await waitFor(() => {
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('prevents enrollment for users without student role', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock authenticated user with no role
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      dbUser: { id: 'user-1' }, // No role specified
      loading: false,
    });
    
    // Mock not eligible due to role
    (verifyEnrollmentEligibility as jest.Mock).mockResolvedValue({
      canEnroll: false,
      status: 'unauthorized',
      message: 'Your account does not have permission to enroll in courses',
    });

    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for enrollment check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button'));
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Your account does not have permission to enroll in courses'
    );
    
    consoleErrorSpy.mockRestore();
  });
}); 