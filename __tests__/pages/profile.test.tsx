import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';

jest.mock('@/lib/auth/hooks', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 'test-user-id' },
    dbUser: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      photo_url: null,
      created_at: new Date().toISOString(),
    },
    loading: false,
  }),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockReturnThis(),
      getPublicUrl: jest.fn(),
    },
  }),
}));

describe('ProfilePage', () => {
  it('renders profile page with user information', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email address (read-only)')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('User role (read-only)')).toHaveTextContent('student');
  });
}); 