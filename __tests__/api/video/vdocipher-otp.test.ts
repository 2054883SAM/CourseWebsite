import { NextRequest } from 'next/server';
import { POST } from '@/app/api/video/vdocipher-otp/route';

// Mock fetch function
global.fetch = jest.fn();

// Mock crypto module for HMAC generation
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-signature'),
  }),
}));

describe('VdoCipher OTP API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
    
    // Set environment variables
    process.env = {
      ...originalEnv,
      VDO_API_SECRET: 'test-api-secret',
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should return 400 if videoId is missing', async () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/video/vdocipher-otp'), {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Video ID is required');
  });

  it('should return 500 if API_SECRET is not set', async () => {
    // Remove API_SECRET environment variable
    delete process.env.VDO_API_SECRET;

    const req = new NextRequest(new URL('http://localhost:3000/api/video/vdocipher-otp'), {
      method: 'POST',
      body: JSON.stringify({ videoId: 'test-video-id' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API configuration error');
  });

  it('should handle VdoCipher API errors', async () => {
    // Mock fetch to simulate API error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    const req = new NextRequest(new URL('http://localhost:3000/api/video/vdocipher-otp'), {
      method: 'POST',
      body: JSON.stringify({ videoId: 'test-video-id' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toMatch(/VdoCipher API error: 403/);
  });

  it('should successfully generate OTP and return data', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        otp: 'test-otp',
        playbackInfo: 'test-playback-info',
      }),
    });

    const req = new NextRequest(new URL('http://localhost:3000/api/video/vdocipher-otp'), {
      method: 'POST',
      body: JSON.stringify({ videoId: 'test-video-id' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.otp).toBe('test-otp');
    expect(data.playbackInfo).toBe('test-playback-info');

    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith('https://dev.vdocipher.com/api/videos/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: expect.any(String),
    });
  });
});