import { supabase } from '@/lib/supabase/client';
import { validateToken, refreshToken } from '@/lib/auth/token-utils';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

describe('Token Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateToken', () => {
    it('should return true for valid session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { expires_at: Date.now() / 1000 + 3600 } }, // 1 hour from now in seconds
        error: null,
      });

      const isValid = await validateToken();
      expect(isValid).toBe(true);
    });

    it('should return false for expired session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { expires_at: Date.now() / 1000 - 3600 } }, // 1 hour ago in seconds
        error: null,
      });

      const isValid = await validateToken();
      expect(isValid).toBe(false);
    });

    it('should return false for no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const isValid = await validateToken();
      expect(isValid).toBe(false);
    });

    it('should return false on error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: new Error('Failed to get session'),
      });

      const isValid = await validateToken();
      expect(isValid).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh session', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: { access_token: 'new_token' } },
        error: null,
      });

      const result = await refreshToken();
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle refresh failure', async () => {
      const error = new Error('Failed to refresh');
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error,
      });

      const result = await refreshToken();
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should handle unexpected errors', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await refreshToken();
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });
}); 