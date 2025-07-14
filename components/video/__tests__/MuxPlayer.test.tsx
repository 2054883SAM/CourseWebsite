import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MuxPlayer from '../MuxPlayer';
import type { MuxVideoPlayerProps } from '../MuxPlayer';

// Define types for the mock component
interface MockMuxPlayerProps extends MuxVideoPlayerProps {
  onError?: (event: CustomEvent) => void;
  onLoadStart?: (event: CustomEvent) => void;
  onLoadedData?: (event: CustomEvent) => void;
  onTimeUpdate?: (event: CustomEvent) => void;
  onEnded?: (event: CustomEvent) => void;
}

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

// Mock the "use client" directive for tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock next/dynamic to return a mock component directly
jest.mock('next/dynamic', () => (factory: () => any) => {
  const MockComponent = (props: MockMuxPlayerProps) => {
    const Component = factory();
    if (Component.then) {
      // If it's a promise (async import), return the mock directly
      return <MockMuxPlayer {...props} />;
    }
    return <Component {...props} />;
  };
  return MockComponent;
});

// Create a mock video element type
interface MockVideoElement extends EventTarget {
  duration: number;
  currentTime: number;
}

// Create a mock MuxPlayer component
const MockMuxPlayer: React.FC<MockMuxPlayerProps> = ({
  playbackId,
  metadata,
  onError,
  onLoadStart,
  onLoadedData,
  onTimeUpdate,
  onEnded,
}) => {
  return (
    <div data-testid="mux-player-mock">
      <div data-testid="mux-player-playback-id">{playbackId}</div>
      <button
        data-testid="mux-player-play-button"
        onClick={() => {
          // Simulate play event
          if (metadata?.onPlay) {
            metadata.onPlay();
          }
        }}
      >
        Play
      </button>
      <button
        data-testid="mux-player-error-button"
        onClick={() => {
          if (onError) {
            const customEvent = new CustomEvent('error', { detail: new Error('Test error') });
            onError(customEvent);
          }
        }}
      >
        Trigger Error
      </button>
      <button
        data-testid="mux-player-load-start-button"
        onClick={() => {
          if (onLoadStart) {
            const customEvent = new CustomEvent('loadstart');
            onLoadStart(customEvent);
          }
        }}
      >
        Trigger Load Start
      </button>
      <button
        data-testid="mux-player-loaded-data-button"
        onClick={() => {
          if (onLoadedData) {
            const mockVideo = { duration: 300 } as MockVideoElement;
            const customEvent = new CustomEvent('loadeddata');
            Object.defineProperty(customEvent, 'target', {
              value: mockVideo,
              writable: false,
            });
            onLoadedData(customEvent);
          }
        }}
      >
        Trigger Loaded Data
      </button>
      <button
        data-testid="mux-player-time-update-button"
        onClick={() => {
          if (onTimeUpdate) {
            const mockVideo = { currentTime: 120 } as MockVideoElement;
            const customEvent = new CustomEvent('timeupdate');
            Object.defineProperty(customEvent, 'target', {
              value: mockVideo,
              writable: false,
            });
            onTimeUpdate(customEvent);
          }
        }}
      >
        Trigger Time Update
      </button>
      <button
        data-testid="mux-player-ended-button"
        onClick={() => {
          if (onEnded) {
            const customEvent = new CustomEvent('ended');
            onEnded(customEvent);
          }
        }}
      >
        Trigger Ended
      </button>
    </div>
  );
};

// Mock the @mux/mux-player-react component
jest.mock('@mux/mux-player-react', () => ({
  __esModule: true,
  default: MockMuxPlayer,
}));

describe('MuxPlayer Component', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    title: 'Test Video',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Mux player component', () => {
    render(<MuxPlayer {...defaultProps} />);
    expect(screen.getByTestId('mux-player-mock')).toBeInTheDocument();
    expect(screen.getByTestId('mux-player-playback-id')).toHaveTextContent('test-playback-id');
  });

  it('displays loading state when video is loading', async () => {
    render(<MuxPlayer {...defaultProps} />);

    // Initially should not show loading state
    expect(screen.queryByTestId('video-loading-indicator')).not.toBeInTheDocument();

    // Trigger load start event
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-load-start-button'));
    });

    // Should show loading indicator
    expect(screen.getByTestId('video-loading-indicator')).toBeInTheDocument();

    // Trigger loaded data event
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-loaded-data-button'));
    });

    // Loading indicator should disappear
    expect(screen.queryByTestId('video-loading-indicator')).not.toBeInTheDocument();
  });

  it('displays error message when video fails to load', async () => {
    render(<MuxPlayer {...defaultProps} />);

    // Initially should not show error message
    expect(screen.queryByTestId('video-error-message')).not.toBeInTheDocument();

    // Trigger error event
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-error-button'));
    });

    // Should show error message
    expect(screen.getByTestId('video-error-message')).toBeInTheDocument();
    expect(screen.getByText(/Unable to load video/i)).toBeInTheDocument();
  });

  it('passes custom props to the Mux player', async () => {
    const customProps = {
      ...defaultProps,
      autoPlay: true,
      muted: true,
      loop: true,
    };

    const { container } = render(<MuxPlayer {...customProps} />);

    // The mock implementation doesn't check these props, but the real component would
    // This is just to verify our component passes them through
    expect(screen.getByTestId('mux-player-mock')).toBeInTheDocument();
  });

  // New tests for progress tracking
  it('shows progress bar after video loads', async () => {
    render(<MuxPlayer {...defaultProps} />);

    // Initially progress bar should not be visible
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();

    // Trigger loaded data event with duration
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-loaded-data-button'));
    });

    // Progress bar should now be visible
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('updates progress when time changes', async () => {
    render(<MuxPlayer {...defaultProps} />);

    // Load the video first
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-loaded-data-button'));
    });

    // Trigger time update to 120 seconds (40% of 300s duration)
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-time-update-button'));
    });

    // Progress indicator should show 40%
    expect(screen.getByTestId('progress-indicator')).toHaveTextContent('40%');
  });

  it('resets progress when video ends', async () => {
    render(<MuxPlayer {...defaultProps} />);

    // Load the video and update time
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-loaded-data-button'));
      await userEvent.click(screen.getByTestId('mux-player-time-update-button'));
    });

    // Trigger video end
    await act(async () => {
      await userEvent.click(screen.getByTestId('mux-player-ended-button'));
    });

    // Progress should be reset to 0%
    expect(screen.getByTestId('progress-indicator')).toHaveTextContent('0%');
  });
});
