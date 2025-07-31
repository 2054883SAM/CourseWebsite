import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VdoCipherPlayer from '@/components/video/VdoCipherPlayer';

// Mock the fetch function for OTP API requests
global.fetch = jest.fn();

// Mock crypto module for JWT signing
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hmac-signature'),
  }),
}));

describe('VdoCipherPlayer', () => {
  // Mock script injection
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
    
    // Mock the OTP API response
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          otp: 'test-otp',
          playbackInfo: 'test-playback-info'
        })
      })
    );

    // Mock script loading
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'script') {
        return {
          setAttribute: jest.fn(),
          addEventListener: jest.fn((event, callback) => {
            if (event === 'load') {
              // Simulate script loaded
              setTimeout(callback, 0);
            }
          }),
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    document.body.appendChild = jest.fn().mockReturnValue(null);

    // Mock VdoCipher object
    (window as any).VdoCipher = {
      init: jest.fn().mockImplementation((params, onSuccess) => {
        onSuccess && onSuccess();
        return {
          play: jest.fn(),
          pause: jest.fn(),
          destroy: jest.fn(),
        };
      }),
    };
  });

  afterEach(() => {
    // Restore original functions
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  it('should render a loading state initially', async () => {
    render(
      <VdoCipherPlayer 
        videoId="0d08afbb3ebd7449eb6f9a61675d3923"
        apiKey="test-api-key"
        className="test-class" 
      />
    );

    expect(screen.getByTestId('vdo-loading')).toBeInTheDocument();
  });

  it('should fetch OTP and initialize the player', async () => {
    render(
      <VdoCipherPlayer 
        videoId="0d08afbb3ebd7449eb6f9a61675d3923"
        apiKey="test-api-key"
        className="test-class" 
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect((window as any).VdoCipher.init).toHaveBeenCalled();
      expect(screen.getByTestId('vdo-player-container')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    // Mock a failed API response
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })
    );

    render(
      <VdoCipherPlayer 
        videoId="0d08afbb3ebd7449eb6f9a61675d3923"
        apiKey="test-api-key"
        className="test-class" 
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('vdo-error')).toBeInTheDocument();
      expect(screen.getByText(/Error loading video/i)).toBeInTheDocument();
    });
  });

  it('should handle player initialization errors', async () => {
    // Mock successful OTP fetch but failed player initialization
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          otp: 'test-otp',
          playbackInfo: 'test-playback-info'
        })
      })
    );

    // Mock VdoCipher.init to trigger error
    (window as any).VdoCipher.init = jest.fn().mockImplementation((params, onSuccess, onFailure) => {
      onFailure && onFailure(new Error('Player initialization failed'));
      return null;
    });

    render(
      <VdoCipherPlayer 
        videoId="0d08afbb3ebd7449eb6f9a61675d3923"
        apiKey="test-api-key"
        className="test-class" 
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('vdo-error')).toBeInTheDocument();
      expect(screen.getByText(/Error initializing video player/i)).toBeInTheDocument();
    });
  });

  it('should clean up the player when unmounted', async () => {
    const destroyMock = jest.fn();
    (window as any).VdoCipher.init = jest.fn().mockImplementation(() => ({
      destroy: destroyMock,
    }));

    const { unmount } = render(
      <VdoCipherPlayer 
        videoId="0d08afbb3ebd7449eb6f9a61675d3923"
        apiKey="test-api-key"
        className="test-class" 
      />
    );

    await waitFor(() => {
      expect((window as any).VdoCipher.init).toHaveBeenCalled();
    });

    unmount();
    expect(destroyMock).toHaveBeenCalled();
  });
});