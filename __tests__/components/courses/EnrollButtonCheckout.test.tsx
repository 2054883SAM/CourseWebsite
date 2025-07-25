import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseActions } from '@/app/courses/[id]/components/CourseActions';
import { useAuth } from '@/lib/auth/hooks';
import { verifyEnrollmentEligibility } from '@/lib/supabase/enrollments';
import { initiateCheckout } from '@/lib/supabase/checkout';
import { loadPaddleJs } from '@/lib/paddle/client';
import { Course, Section } from '@/lib/supabase/types';

// Mock dependencies
jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/supabase/enrollments', () => ({
  verifyEnrollmentEligibility: jest.fn(),
}));

jest.mock('@/lib/supabase/checkout', () => ({
  initiateCheckout: jest.fn(),
}));

jest.mock('@/lib/paddle/client', () => ({
  loadPaddleJs: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('EnrollButton Checkout Integration', () => {
  const mockCourse: Course = {
    id: 'course-1',
    title: 'Test Course',
    description: 'Test Description',
    thumbnail_url: '/test.jpg',
    price: 29.99,
    creator_id: 'creator-1',
    created_at: '2023-01-01',
    creator: { 
      id: 'creator-1', 
      name: 'Test Creator', 
      email: 'creator@test.com',
      role: 'creator' as const, // Use 'as const' to ensure it's the literal type
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
    jest.clearAllMocks();
    
    // Default auth mock
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      dbUser: { id: 'user-1', role: 'student' },
      loading: false,
    });
    
    // Default eligibility mock
    (verifyEnrollmentEligibility as jest.Mock).mockResolvedValue({
      canEnroll: true,
      status: 'eligible',
      message: 'You can enroll in this course',
    });
    
    // Default checkout mock
    (initiateCheckout as jest.Mock).mockResolvedValue({
      success: true,
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

  it('loads Paddle.js on component mount', async () => {
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    await waitFor(() => {
      expect(loadPaddleJs).toHaveBeenCalledTimes(1);
    });
  });

  it('calls initiateCheckout with correct course ID when clicked', async () => {
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for eligibility check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalledWith(
        'user-1',
        'student',
        'course-1'
      );
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that initiateCheckout was called with the correct course ID
    await waitFor(() => {
      expect(initiateCheckout).toHaveBeenCalledWith('course-1');
    });
  });

  it('shows success state after successful checkout', async () => {
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for eligibility check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that the button shows enrolled state after successful checkout
    await waitFor(() => {
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
  });

  it('shows error message on checkout failure', async () => {
    // Mock checkout failure
    (initiateCheckout as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Checkout failed',
    });
    
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for eligibility check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Checkout failed')).toBeInTheDocument();
    });
    
    // Check that the button is reset to not-enrolled state
    expect(screen.getByRole('button', { name: /Enroll/i })).toBeInTheDocument();
  });

  it('handles "already enrolled" response correctly', async () => {
    // Mock already enrolled response
    (initiateCheckout as jest.Mock).mockResolvedValue({
      success: false,
      alreadyEnrolled: true,
      error: "You're already enrolled in this course",
    });
    
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for eligibility check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that the button shows enrolled state
    await waitFor(() => {
      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
  });

  it('handles errors thrown during checkout process', async () => {
    // Mock checkout throwing an error
    (initiateCheckout as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<CourseActions course={mockCourse} sections={mockSections} />);
    
    // Wait for eligibility check to complete
    await waitFor(() => {
      expect(verifyEnrollmentEligibility).toHaveBeenCalled();
    });
    
    // Click the enroll button
    fireEvent.click(screen.getByRole('button', { name: /Enroll/i }));
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
}); 