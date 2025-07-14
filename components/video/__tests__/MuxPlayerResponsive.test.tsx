import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MuxPlayer from '../MuxPlayer';

// Mock the VideoProgress component
jest.mock('../VideoProgress', () => ({
  VideoProgress: ({ videoId, duration, currentTime }: any) => (
    <div
      data-testid="progress-bar"
      className="absolute left-0 top-0 h-full rounded-full transition-all"
    >
      <div data-testid="progress-indicator">{Math.round((currentTime / duration) * 100)}%</div>
    </div>
  ),
}));

// Mock the @mux/mux-player-react module
jest.mock('@mux/mux-player-react', () => ({
  __esModule: true,
  default: function MockMuxPlayer(props: any) {
    // Simulate loading state immediately
    setTimeout(() => {
      props.onLoadStart?.(new CustomEvent('loadstart'));

      // Simulate loaded data after a short delay
      setTimeout(() => {
        const event = new CustomEvent('loadeddata');
        Object.defineProperty(event, 'target', {
          value: { duration: 300 } as HTMLVideoElement,
          enumerable: true,
        });
        props.onLoadedData?.(event);
      }, 10);
    }, 0);

    return (
      <div
        data-testid="mux-player-mock"
        className="h-full w-full"
        onClick={() => {
          // Simulate error when clicked
          props.onError?.(new CustomEvent('error'));
        }}
      >
        Mock Mux Player
      </div>
    );
  },
}));

// Mock next/dynamic to return the mock component directly
jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent(props: any) {
    const MockedComponent = jest.requireMock('@mux/mux-player-react').default;
    return <MockedComponent {...props} />;
  };
});

describe('MuxPlayer Responsive Design', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    title: 'Test Video',
  };

  beforeEach(() => {
    // Reset window dimensions before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Default to desktop width
    });

    // Clear all timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test for default aspect ratio
  it('maintains 16:9 aspect ratio by default', () => {
    const { container } = render(<MuxPlayer {...defaultProps} />);
    const playerContainer = container.querySelector('.aspect-video');
    expect(playerContainer).toBeInTheDocument();
    expect(playerContainer).toHaveClass('w-full');
  });

  // Test for custom container width
  it('respects custom container width', () => {
    const { container } = render(<MuxPlayer {...defaultProps} className="w-1/2" />);
    const playerWrapper = container.firstChild as HTMLElement;
    expect(playerWrapper).toHaveClass('w-1/2');
  });

  // Test for mobile viewport
  it('adapts to mobile viewport', async () => {
    // Set mobile viewport width
    window.innerWidth = 375;
    const { container } = render(<MuxPlayer {...defaultProps} />);

    // Wait for loading state
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // Loading indicator should be visible and have mobile styles
    const loadingSpinner = container.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('h-8', 'w-8');

    // Trigger error state
    const mockMuxPlayer = container.querySelector('[data-testid="mux-player-mock"]') as HTMLElement;
    act(() => {
      fireEvent.click(mockMuxPlayer);
    });

    // Wait for state updates
    await act(async () => {
      await Promise.resolve();
    });

    // Error text should have mobile styles
    const errorMessage = container.querySelector('[data-testid="video-error-message"]');
    expect(errorMessage).toBeInTheDocument();
    const errorText = errorMessage?.querySelector('p');
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-base', 'font-semibold', 'sm:text-lg');
  });

  // Test for tablet viewport
  it('adapts to tablet viewport', async () => {
    window.innerWidth = 768;
    const { container } = render(<MuxPlayer {...defaultProps} />);

    // Wait for loading state
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // Loading indicator should be visible and have tablet styles
    const loadingSpinner = container.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('h-8', 'w-8', 'sm:h-12', 'sm:w-12');

    // Wait for loaded state
    act(() => {
      jest.advanceTimersByTime(10);
    });

    // Progress bar should have tablet spacing
    const progressContainer = container.querySelector('.mt-2');
    expect(progressContainer).toBeInTheDocument();
    expect(progressContainer).toHaveClass('sm:mt-3');
  });

  // Test for proper scaling of loading indicator
  it('scales loading indicator properly on different screen sizes', async () => {
    const { container } = render(<MuxPlayer {...defaultProps} />);

    // Wait for loading state
    act(() => {
      jest.advanceTimersByTime(0);
    });

    // Loading indicator should have proper positioning and layout
    const loadingIndicator = container.querySelector('[data-testid="video-loading-indicator"]');
    expect(loadingIndicator).toBeInTheDocument();
    expect(loadingIndicator).toHaveClass(
      'absolute',
      'inset-0',
      'z-10',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  // Test for proper error message display
  it('displays error message properly on different screen sizes', async () => {
    const { container } = render(<MuxPlayer {...defaultProps} />);

    // Trigger error state
    const mockMuxPlayer = container.querySelector('[data-testid="mux-player-mock"]') as HTMLElement;
    act(() => {
      fireEvent.click(mockMuxPlayer);
    });

    // Wait for state updates
    await act(async () => {
      await Promise.resolve();
    });

    // Error message should have proper positioning and layout
    const errorMessage = container.querySelector('[data-testid="video-error-message"]');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass(
      'absolute',
      'inset-0',
      'z-10',
      'flex',
      'items-center',
      'justify-center',
      'text-center'
    );

    // Error text should have proper styling
    const errorText = errorMessage!.querySelector('p');
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-base', 'font-semibold', 'sm:text-lg');
  });

  // Test for progress bar responsiveness
  it('renders progress bar responsively', async () => {
    const { container } = render(<MuxPlayer {...defaultProps} />);

    // Wait for loading and loaded states
    act(() => {
      jest.advanceTimersByTime(20);
    });

    // Progress bar should have proper styling
    const progressBar = container.querySelector('[data-testid="progress-bar"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveClass(
      'absolute',
      'left-0',
      'top-0',
      'h-full',
      'rounded-full',
      'transition-all'
    );
  });

  // Test for video container shadow and rounded corners
  it('applies proper styling to video container', () => {
    const { container } = render(<MuxPlayer {...defaultProps} />);
    const videoContainer = container.querySelector('.aspect-video');
    expect(videoContainer).toBeInTheDocument();
    expect(videoContainer).toHaveClass('rounded-lg', 'shadow-lg', 'overflow-hidden');
  });
});
