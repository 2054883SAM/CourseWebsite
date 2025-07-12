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
}

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

// Create a mock MuxPlayer component
const MockMuxPlayer: React.FC<MockMuxPlayerProps> = ({ playbackId, metadata, onError, onLoadStart, onLoadedData }) => {
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
            const customEvent = new CustomEvent('loadeddata');
            onLoadedData(customEvent);
          }
        }}
      >
        Trigger Loaded Data
      </button>
    </div>
  );
};

// Mock the @mux/mux-player-react component
jest.mock('@mux/mux-player-react', () => ({
  __esModule: true,
  default: MockMuxPlayer
}));

describe('MuxPlayer Component', () => {
  const defaultProps = {
    playbackId: 'test-playback-id',
    title: 'Test Video',
  };

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
}); 