import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

jest.mock('@/lib/auth/api-middleware', () => ({
  validateApiAuth: jest.fn(),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => {
  const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null }, error: null });
  return {
    createMiddlewareClient: jest.fn().mockReturnValue({
      auth: {
        getSession: mockGetSession,
      },
    }),
  };
});

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockReturnValue({
        status: undefined,
        headers: new Map(),
      }),
      redirect: jest.fn().mockImplementation((url) => ({
        status: 307,
        headers: new Map([['location', url]]),
      })),
    },
  };
});

const createMockRequest = (url: string) => {
  const headers = new Headers();
  return {
    url,
    headers,
    nextUrl: new URL(url),
    method: 'GET',
    cookies: new Map(),
  } as unknown as NextRequest;
};

describe('Middleware', () => {
  let mockRequest: NextRequest;
  let mockGetSession: jest.Mock;

  beforeEach(() => {
    mockRequest = createMockRequest('http://localhost:3000/dashboard');
    mockGetSession = (require('@supabase/auth-helpers-nextjs').createMiddlewareClient)().auth.getSession;
    jest.clearAllMocks();
  });

  it('should allow access to public routes without authentication', async () => {
    mockRequest = createMockRequest('http://localhost:3000/signin');

    const response = await middleware(mockRequest as NextRequest);

    expect(response.status).not.toBe(307); // Not a redirect
  });

  it('should redirect to signin for protected routes when not authenticated', async () => {
    const validateApiAuth = require('@/lib/auth/api-middleware').validateApiAuth;
    validateApiAuth.mockRejectedValue(new Error('Unauthorized'));

    const response = await middleware(mockRequest as NextRequest);

    expect(response.status).toBe(307); // Next.js uses 307 for temporary redirects
    expect(response.headers.get('location')).toBe('http://localhost:3000/signin?redirectTo=%2Fdashboard');
  });

  it('should allow access to protected routes when authenticated with sufficient role', async () => {
    const validateApiAuth = require('@/lib/auth/api-middleware').validateApiAuth;
    validateApiAuth.mockResolvedValue({ userId: 'test-user-id', role: 'admin' });

    mockGetSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'test-user-id' },
          access_token: 'test-token',
        },
      },
      error: null,
    });

    const response = await middleware(mockRequest as NextRequest);

    expect(response.status).not.toBe(307); // Not a redirect
  });

  it('should handle authentication errors gracefully', async () => {
    const validateApiAuth = require('@/lib/auth/api-middleware').validateApiAuth;
    validateApiAuth.mockRejectedValue(new Error('Token expired'));

    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Token expired'),
    });

    const response = await middleware(mockRequest as NextRequest);

    expect(response.status).toBe(307); // Next.js uses 307 for temporary redirects
    expect(response.headers.get('location')).toBe('http://localhost:3000/signin?redirectTo=%2Fdashboard');
  });
}); 