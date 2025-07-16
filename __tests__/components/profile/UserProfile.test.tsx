import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '@/components/profile/UserProfile';

// Mock auth hooks
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

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({ src, alt, width, height, className }: any) {
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  },
}));

// Mock window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => {
  const mockUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: null, error: null }),
  });

  const mockFrom = jest.fn().mockReturnValue({
    update: mockUpdate,
  });

  const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null });
  const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } });

  const mockStorageFrom = jest.fn().mockReturnValue({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  });

  return {
    createClientComponentClient: jest.fn().mockReturnValue({
      from: mockFrom,
      storage: {
        from: mockStorageFrom,
      },
    }),
  };
});

describe('UserProfile', () => {
  let mockFrom: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockStorageFrom: jest.Mock;
  let mockUpload: jest.Mock;
  let mockGetPublicUrl: jest.Mock;

  beforeEach(() => {
    const mockClient = (require('@supabase/auth-helpers-nextjs').createClientComponentClient)();
    mockFrom = mockClient.from;
    mockUpdate = mockFrom().update;
    mockStorageFrom = mockClient.storage.from;
    mockUpload = mockStorageFrom().upload;
    mockGetPublicUrl = mockStorageFrom().getPublicUrl;
    mockReload.mockClear();
    jest.clearAllMocks();
  });

  it('should render user profile information', () => {
    render(<UserProfile />);
    
    expect(screen.getByLabelText('Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email address (read-only)')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('User role (read-only)')).toHaveTextContent('student');
  });

  it('should show loading state', () => {
    (require('@/lib/auth/hooks').useAuth).mockReturnValueOnce({
      loading: true,
    });

    render(<UserProfile />);
    expect(screen.getByLabelText('Loading profile')).toBeInTheDocument();
  });

  it('should show unauthenticated state', () => {
    (require('@/lib/auth/hooks').useAuth).mockReturnValueOnce({
      user: null,
      dbUser: null,
      loading: false,
    });

    render(<UserProfile />);
    expect(screen.getByText('Not authenticated. Please sign in to view your profile.')).toBeInTheDocument();
  });

  it('should handle profile update', async () => {
    const updatedName = 'Updated Name';
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: { name: updatedName }, error: null }),
    });

    render(<UserProfile />);
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: updatedName } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('should handle profile update error', async () => {
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
    });

    render(<UserProfile />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  it('should handle photo upload', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockPhotoUrl = 'https://example.com/photo.jpg';
    
    mockUpload.mockResolvedValue({ data: { path: 'test.jpg' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: mockPhotoUrl } });
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: { photo_url: mockPhotoUrl }, error: null }),
    });

    render(<UserProfile />);
    
    const fileInput = screen.getByLabelText('Upload profile photo');
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Photo uploaded successfully')).toBeInTheDocument();
      expect(mockReload).toHaveBeenCalled();
    });
  });

  it('should handle photo upload error', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    mockUpload.mockResolvedValue({ data: null, error: new Error('Upload failed') });

    render(<UserProfile />);
    
    const fileInput = screen.getByLabelText('Upload profile photo');
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Failed to upload photo')).toBeInTheDocument();
    });
  });

  it('should show profile photo placeholder when no photo exists', () => {
    render(<UserProfile />);
    expect(screen.getByLabelText('Profile photo placeholder')).toBeInTheDocument();
  });

  it('should show profile photo when one exists', () => {
    (require('@/lib/auth/hooks').useAuth).mockReturnValueOnce({
      user: { id: 'test-user-id' },
      dbUser: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        photo_url: 'https://example.com/photo.jpg',
        created_at: new Date().toISOString(),
      },
      loading: false,
    });

    render(<UserProfile />);
    const img = screen.getByAltText('Test User\'s profile photo');
    expect(img).toBeInTheDocument();
  });

  it('should disable form submission while updating', async () => {
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))),
    });

    render(<UserProfile />);
    
    const form = screen.getByRole('form');
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    
    fireEvent.submit(form);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Saving...');
    expect(submitButton).toHaveAttribute('aria-disabled', 'true');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Save Changes');
    });
  });

  it('should validate name input', () => {
    render(<UserProfile />);
    
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveAttribute('required');
    expect(nameInput).toHaveAttribute('minLength', '2');
    expect(nameInput).toHaveAttribute('maxLength', '50');
  });
}); 