import { validateApiAuth } from '@/lib/auth/api-middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn()
}));
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('API Middleware', () => {
  let mockRequest: NextRequest;
  let mockSupabase: any;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost/api/test');
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should allow requests with valid session', async () => {
    const mockSession = {
      user: { id: 'test-user-id' }
    };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockSupabase.single.mockResolvedValue({ data: { role: 'student' }, error: null });

    const result = await validateApiAuth(mockRequest);
    expect(result).toEqual({
      userId: 'test-user-id',
      role: 'student'
    });
  });

  it('should reject requests without session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(validateApiAuth(mockRequest)).rejects.toThrow('Unauthorized');
  });

  it('should reject requests with invalid session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: new Error('Invalid session') });

    await expect(validateApiAuth(mockRequest)).rejects.toThrow('Unauthorized');
  });

  it('should reject requests without user data', async () => {
    const mockSession = {
      user: { id: 'test-user-id' }
    };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockSupabase.single.mockResolvedValue({ data: null, error: new Error('User not found') });

    await expect(validateApiAuth(mockRequest)).rejects.toThrow('User not found');
  });

  it('should handle database errors', async () => {
    const mockSession = {
      user: { id: 'test-user-id' }
    };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Database error') });

    await expect(validateApiAuth(mockRequest)).rejects.toThrow('User not found');
  });
}); 