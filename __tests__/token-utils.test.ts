import { supabase } from '@/lib/supabase/client';
import { validateToken, refreshToken } from '@/lib/auth/token-utils';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
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
    it('should return true when user is returned', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'a@b.com' } },
        error: null,
      });

      const isValid = await validateToken();
      expect(isValid).toBe(true);
    });

    it('should return false for no session', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const isValid = await validateToken();
      expect(isValid).toBe(false);
    });

    it('should return false on error', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
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
      (supabase.auth.refreshSession as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      const result = await refreshToken();
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });
  });
});
