import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { withAuth } from '../withAuth';
import { useAuth } from '@/lib/auth/AuthContext';
import { Role } from '@/lib/auth/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth context
jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Test component
const TestComponent = () => <div>Protected Content</div>;

describe('Route Protection', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('withAuth HOC', () => {
    it('should show loading component when authentication is loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
        checkPermission: jest.fn(),
      });

      const ProtectedComponent = withAuth(TestComponent, { requireAuth: true });
      render(<ProtectedComponent />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show unauthorized component when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        checkPermission: jest.fn(),
      });

      const ProtectedComponent = withAuth(TestComponent, { requireAuth: true });
      render(<ProtectedComponent />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('You need to be signed in to access this page.')).toBeInTheDocument();
    });

    it('should render component when authentication is not required', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        checkPermission: jest.fn(),
      });

      const ProtectedComponent = withAuth(TestComponent, { requireAuth: false });
      render(<ProtectedComponent />);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render component when user is authenticated and no role is required', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', role: 'student' },
        loading: false,
        checkPermission: jest.fn(),
      });

      const ProtectedComponent = withAuth(TestComponent, { requireAuth: true });
      render(<ProtectedComponent />);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show unauthorized when user lacks required role', () => {
      const mockCheckPermission = jest.fn().mockReturnValue(false);
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', role: 'student' },
        loading: false,
        checkPermission: mockCheckPermission,
      });

      const ProtectedComponent = withAuth(TestComponent, { 
        requireAuth: true,
        requiredRole: 'admin' as Role,
      });
      render(<ProtectedComponent />);

      expect(mockCheckPermission).toHaveBeenCalledWith('admin');
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    it('should render component when user has required role', () => {
      const mockCheckPermission = jest.fn().mockReturnValue(true);
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: '1', role: 'admin' },
        loading: false,
        checkPermission: mockCheckPermission,
      });

      const ProtectedComponent = withAuth(TestComponent, { 
        requireAuth: true,
        requiredRole: 'admin' as Role,
      });
      render(<ProtectedComponent />);

      expect(mockCheckPermission).toHaveBeenCalledWith('admin');
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
}); 