import { validateApiAuth } from '@/lib/auth/api-middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn()
}));
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));
jest.mock('@/lib/auth/api-middleware');

describe('User Profile API', () => {
  let mockRequest: NextRequest;
  let mockSupabase: any;

  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost/api/users/profile');
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
    (validateApiAuth as jest.Mock).mockResolvedValue({ userId: 'test-user-id', role: 'student' });
  });

  describe('GET /api/users/profile', () => {
    it('should return 401 if not authenticated', async () => {
      (validateApiAuth as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
      
      const { GET } = require('@/app/api/users/profile/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return user profile if authenticated', async () => {
      const mockProfile = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        photo_url: null,
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const { GET } = require('@/app/api/users/profile/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockProfile);
    });

    it('should return 500 if database error occurs', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Database error') });
      
      const { GET } = require('@/app/api/users/profile/route');
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Failed to fetch user profile' });
    });
  });

  describe('PUT /api/users/profile', () => {
    const mockProfileUpdate = {
      name: 'Updated Name',
      photo_url: 'https://example.com/photo.jpg',
    };

    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(mockProfileUpdate),
      });
    });

    it('should return 401 if not authenticated', async () => {
      (validateApiAuth as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
      
      const { PUT } = require('@/app/api/users/profile/route');
      const response = await PUT(mockRequest);
      
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should update user profile if authenticated', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: { ...mockProfileUpdate, id: 'test-user-id' },
        error: null 
      });
      
      const { PUT } = require('@/app/api/users/profile/route');
      const response = await PUT(mockRequest);
      
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        ...mockProfileUpdate,
        id: 'test-user-id'
      });
      expect(mockSupabase.update).toHaveBeenCalledWith(mockProfileUpdate);
    });

    it('should return 400 if invalid data is provided', async () => {
      mockRequest = new NextRequest('http://localhost/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ invalid: 'data' }),
      });
      
      const { PUT } = require('@/app/api/users/profile/route');
      const response = await PUT(mockRequest);
      
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Invalid profile data' });
    });

    it('should return 500 if database error occurs', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: new Error('Database error') });
      
      const { PUT } = require('@/app/api/users/profile/route');
      const response = await PUT(mockRequest);
      
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Failed to update user profile' });
    });
  });
}); 