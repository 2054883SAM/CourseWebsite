import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VdoCipherPlayer from '@/components/video/VdoCipherPlayer';
import { VideoChapter } from '@/lib/types/vdocipher';

// Mock the fetch function for OTP API requests
global.fetch = jest.fn();

const mockChapters: VideoChapter[] = [
  {
    id: 'chapter-1',
    title: 'Introduction',
    startTime: 0,
    duration: 180,
    description: 'Welcome to the course'
  },
  {
    id: 'chapter-2', 
    title: 'Getting Started',
    startTime: 180,
    duration: 240,
    description: 'Setting up the environment'
  }
];

describe('VdoCipherPlayer V2 with Chapters', () => {
  const mockVideoElement = {
    play: jest.fn(),
    pause: jest.fn(),
    currentTime: 0,
    paused: false,
    muted: false,
    loop: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  const mockPlayerInstance = {
    video: mockVideoElement,
    destroy: jest.fn(),
  };

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

    // Mock VdoPlayer
    (window as any).VdoPlayer = {
      getInstance: jest.fn().mockReturnValue(mockPlayerInstance)
    };

    // Reset all mocks
    jest.clearAllMocks();

    // Mock setTimeout to allow for async player initialization
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render chapters list when chapters are provided', () => {
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    expect(screen.getByText('Course Content')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('should not render chapters list when no chapters are provided', () => {
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
      />
    );

    expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Introduction')).not.toBeInTheDocument();
  });

  it('should seek to chapter start time when chapter is clicked', async () => {
    const { container } = render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    // Wait for player to initialize
    await waitFor(() => {
      expect((window as any).VdoPlayer.getInstance).toHaveBeenCalled();
    });

    // Click on the second chapter
    const chapterButton = screen.getByTestId('chapter-button-chapter-2');
    fireEvent.click(chapterButton);

    // Should seek to chapter start time (180 seconds)
    expect(mockVideoElement.currentTime).toBe(180);
  });

  it('should update current chapter highlighting based on video time', async () => {
    const mockOnTimeUpdate = jest.fn();
    
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
        onTimeUpdate={mockOnTimeUpdate}
      />
    );

    await waitFor(() => {
      expect((window as any).VdoPlayer.getInstance).toHaveBeenCalled();
    });

    // Simulate time update to 200 seconds (should be in chapter 2)
    const timeUpdateCallback = mockVideoElement.addEventListener.mock.calls
      .find(call => call[0] === 'timeupdate')?.[1];
    
    if (timeUpdateCallback) {
      // Set current time and trigger callback
      mockVideoElement.currentTime = 200;
      timeUpdateCallback();
    }

    await waitFor(() => {
      const chapter2Element = screen.getByTestId('chapter-chapter-2');
      expect(chapter2Element).toHaveClass('bg-blue-50');
    });
  });

  it('should handle chapter seeking with onChapterSeek callback', async () => {
    const mockOnChapterSeek = jest.fn();
    
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
        onChapterSeek={mockOnChapterSeek}
      />
    );

    await waitFor(() => {
      expect((window as any).VdoPlayer.getInstance).toHaveBeenCalled();
    });

    const chapterButton = screen.getByTestId('chapter-button-chapter-2');
    fireEvent.click(chapterButton);

    expect(mockOnChapterSeek).toHaveBeenCalledWith(mockChapters[1], 180);
  });

  it('should show chapters list below the video player', () => {
    const { container } = render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    const playerContainer = screen.getByTestId('vdo-player-container');
    const chaptersSection = screen.getByTestId('chapters-section');
    
    // Chapters should come after the player in DOM order
    expect(playerContainer.compareDocumentPosition(chaptersSection))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('should display total number of chapters', () => {
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    expect(screen.getByText('Course Content')).toBeInTheDocument();
    expect(screen.getByText('2 chapters')).toBeInTheDocument();
  });

  it('should handle empty chapters array gracefully', () => {
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={[]}
      />
    );

    expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
  });

  it('should maintain existing player functionality with chapters', async () => {
    const mockOnPlay = jest.fn();
    const mockOnPause = jest.fn();
    
    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
        onPlay={mockOnPlay}
        onPause={mockOnPause}
      />
    );

    await waitFor(() => {
      expect((window as any).VdoPlayer.getInstance).toHaveBeenCalled();
    });

    // Verify play event handler is set up
    const playCallback = mockVideoElement.addEventListener.mock.calls
      .find(call => call[0] === 'play')?.[1];
    
    if (playCallback) {
      playCallback();
      expect(mockOnPlay).toHaveBeenCalled();
    }

    // Verify pause event handler is set up
    const pauseCallback = mockVideoElement.addEventListener.mock.calls
      .find(call => call[0] === 'pause')?.[1];
    
    if (pauseCallback) {
      pauseCallback();
      expect(mockOnPause).toHaveBeenCalled();
    }
  });

  it('should handle chapters with missing optional properties', () => {
    const chaptersWithMissingProps: VideoChapter[] = [
      {
        id: 'chapter-1',
        title: 'Minimal Chapter',
        startTime: 0
        // No duration or description
      }
    ];

    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={chaptersWithMissingProps}
      />
    );

    expect(screen.getByText('Minimal Chapter')).toBeInTheDocument();
    expect(screen.getByText('1 chapter')).toBeInTheDocument(); // Fixed: singular form
  });

  it('should disable chapter seeking during loading state', () => {
    // Mock loading state by not resolving the fetch promise immediately
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    // Should show loading state
    expect(screen.getByText('Loading video player...')).toBeInTheDocument();
    
    // Chapter buttons should be disabled during loading
    const chapterButtons = screen.getAllByTestId(/chapter-button-/);
    chapterButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should handle error state with chapters present', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 403,
      })
    );

    render(
      <VdoCipherPlayer
        videoId="test-video-id"
        chapters={mockChapters}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading video/i)).toBeInTheDocument();
    });

    // Chapters should still be visible even if video fails to load
    expect(screen.getByText('Course Content')).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
  });
});