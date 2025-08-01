import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import CoursePlayerPage from '@/app/my-learning/[courseId]/page';
import { getEnrolledCourse } from '@/lib/supabase/learning';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock the auth context
jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the getEnrolledCourse function
jest.mock('@/lib/supabase/learning', () => ({
  getEnrolledCourse: jest.fn(),
}));

// Mock the LoadingSpinner component
jest.mock('@/components/ui/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock the VdoCipherPlayer component
jest.mock('@/components/video/VdoCipherPlayer', () => {
  return function MockVdoCipherPlayer({ 
    videoId, 
    title,
    className 
  }: { 
    videoId: string;
    title?: string;
    className?: string;
  }) {
    return (
      <div data-testid="vdo-cipher-player" data-video-id={videoId} className={className}>
        <h1>{title}</h1>
      </div>
    );
  };
});

describe('CoursePlayerPage', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockUser = {
    id: 'user123',
    role: 'student',
  };

  const mockDbUser = {
    id: 'user123',
    name: 'Test User',
    role: 'student',
  };

  const mockCourse = {
    id: 'course123',
    title: 'Test Course',
    description: 'Course description',
    thumbnail_url: '/thumbnail.jpg',
    videoId: 'vdo_video123',
    progress: 50,
    enrollment: {
      id: 'enroll123',
      status: 'active',
      enrolled_at: '2023-01-01',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ courseId: 'course123' });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      dbUser: mockDbUser,
      loading: false,
    });
    (getEnrolledCourse as jest.Mock).mockResolvedValue({
      data: mockCourse,
      error: null,
    });
  });

  it('should redirect to unauthorized page if user is not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      dbUser: null,
      loading: false,
    });

    await act(async () => {
      render(<CoursePlayerPage />);
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/unauthorized?requiredRole=student');
    });
  });

  it('should redirect to unauthorized page if user is not enrolled in the course', async () => {
    (getEnrolledCourse as jest.Mock).mockResolvedValue({
      data: null,
      error: 'Not enrolled in this course',
    });

    await act(async () => {
      render(<CoursePlayerPage />);
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/unauthorized?requiredRole=student');
    });
  });

  it('should show loading state while fetching course data', async () => {
    // Return a promise that doesn't resolve immediately to keep loading state
    (getEnrolledCourse as jest.Mock).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state active
    );
    
    render(<CoursePlayerPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText(/Loading your course content/i)).toBeInTheDocument();
  });

  it('should render the VdoCipherPlayer when user is enrolled in the course', async () => {
    await act(async () => {
      render(<CoursePlayerPage />);
    });

    await waitFor(() => {
      // Should render the course title
      expect(screen.getByText('Test Course')).toBeInTheDocument();
      // The VdoCipherPlayer component is mocked, so we can check if it's called with the right props
      const videoPlayer = screen.getByTestId('vdo-cipher-player');
      expect(videoPlayer).toBeInTheDocument();
      expect(videoPlayer.getAttribute('data-video-id')).toBe('vdo_video123');
    });
  });

  it('should display error message when there is an error fetching course data', async () => {
    (getEnrolledCourse as jest.Mock).mockResolvedValue({
      data: null,
      error: 'Failed to fetch course data',
    });

    await act(async () => {
      render(<CoursePlayerPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch course data/i)).toBeInTheDocument();
    });
  });

  it('should render VdoCipherPlayer with empty videoId when courseData.videoId is not provided', async () => {
    const courseWithoutVideoId = { ...mockCourse, videoId: undefined };
    (getEnrolledCourse as jest.Mock).mockResolvedValue({
      data: courseWithoutVideoId,
      error: null,
    });

    await act(async () => {
      render(<CoursePlayerPage />);
    });

    await waitFor(() => {
      const videoPlayer = screen.getByTestId('vdo-cipher-player');
      expect(videoPlayer).toBeInTheDocument();
      expect(videoPlayer.getAttribute('data-video-id')).toBe('');
    });
  });
}); 