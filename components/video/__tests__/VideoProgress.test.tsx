import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { VideoProgress } from '../VideoProgress';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('VideoProgress Component', () => {
  const defaultProps = {
    videoId: 'test-video-id',
    duration: 300, // 5 minutes in seconds
    onTimeUpdate: jest.fn(),
    onVideoEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with saved progress from localStorage', async () => {
    // Mock saved progress at 60 seconds
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        currentTime: 60,
        lastUpdated: new Date().toISOString(),
      })
    );

    render(<VideoProgress {...defaultProps} />);

    // Should load the saved progress
    expect(defaultProps.onTimeUpdate).toHaveBeenCalledWith(60);
  });

  it('saves progress to localStorage when time updates', async () => {
    const { rerender } = render(<VideoProgress {...defaultProps} />);

    // Simulate time update to 120 seconds
    await act(async () => {
      rerender(<VideoProgress {...defaultProps} currentTime={120} />);
    });

    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      `video-progress-${defaultProps.videoId}`,
      expect.stringContaining('"currentTime":120')
    );
  });

  it('clears progress when video ends', async () => {
    const { rerender } = render(<VideoProgress {...defaultProps} currentTime={150} />);

    // Simulate video end by setting currentTime to duration
    await act(async () => {
      rerender(<VideoProgress {...defaultProps} currentTime={defaultProps.duration} />);
    });

    // Should remove progress from localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      `video-progress-${defaultProps.videoId}`
    );
  });

  it('shows progress indicator in the UI', async () => {
    const { rerender } = render(<VideoProgress {...defaultProps} />);

    // Update current time to 150 seconds (50% of 300s)
    await act(async () => {
      rerender(<VideoProgress {...defaultProps} currentTime={150} />);
    });

    // Should show progress as percentage
    expect(screen.getByTestId('progress-indicator')).toHaveTextContent('50%'); // 150s out of 300s
  });

  it('handles invalid stored progress data', async () => {
    // Mock corrupted data in localStorage
    mockLocalStorage.getItem.mockReturnValue('invalid-json');

    render(<VideoProgress {...defaultProps} />);

    // Should start from beginning
    expect(defaultProps.onTimeUpdate).toHaveBeenCalledWith(0);
  });

  it('updates progress bar width based on current time', async () => {
    const { rerender } = render(<VideoProgress {...defaultProps} />);

    // Simulate time update to 75 seconds (25% of 300s)
    await act(async () => {
      rerender(<VideoProgress {...defaultProps} currentTime={75} />);
    });

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });
});
