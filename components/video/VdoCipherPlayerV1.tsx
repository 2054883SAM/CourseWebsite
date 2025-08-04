'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoChapter } from '@/lib/types/vdocipher';
import ChapterList from './ChapterList';

export interface VdoCipherPlayerProps {
  videoId: string;
  className?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  chapters?: VideoChapter[];
  userId?: string;
  courseId?: string;
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onChapterSeek?: (chapter: VideoChapter, seekTime: number) => void;
  playerRef?: React.RefObject<any>;
}

const VdoCipherPlayer: React.FC<VdoCipherPlayerProps> = ({
  videoId,
  className = '',
  title = '',
  autoPlay = false,
  muted = false,
  loop = false,
  poster,
  chapters = [],
  userId,
  courseId,
  duration = 0,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onChapterSeek,
  playerRef: externalPlayerRef,
}) => {
  const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  // Create a container ref
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [otpData, setOtpData] = useState<{ otp: string; playbackInfo: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const eventHandlersRef = useRef<{ [key: string]: any }>({});
  const checkPlayerIntervalRef = useRef<number | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Load the script on component mount
  useEffect(() => {
    const loadScript = () => {
      if (!document.querySelector('script[src="https://player.vdocipher.com/v2/api.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://player.vdocipher.com/v2/api.js';
        script.async = true;
        document.body.appendChild(script);
        console.log('VdoCipher script appended to body');
      }
    };

    loadScript();

    return () => {
      // Clean up any polling intervals
      if (checkPlayerIntervalRef.current) {
        clearInterval(checkPlayerIntervalRef.current);
        checkPlayerIntervalRef.current = null;
      }
    };
  }, []);

  // Clear event listeners helper function
  const clearEventListeners = () => {
    if (playerInstanceRef.current?.video) {
      Object.keys(eventHandlersRef.current).forEach((event) => {
        const handler = eventHandlersRef.current[event];
        if (handler) {
          playerInstanceRef.current.video.removeEventListener(event, handler);
        }
      });
    }
    eventHandlersRef.current = {};
  };

  // Chapter seeking function
  const handleChapterSeek = (chapter: VideoChapter) => {
    if (playerInstanceRef.current?.video) {
      try {
        playerInstanceRef.current.video.currentTime = chapter.startTime;
        setCurrentTime(chapter.startTime);

        // Call external callback if provided
        if (onChapterSeek) {
          onChapterSeek(chapter, chapter.startTime);
        }
      } catch (error) {
        console.error('Error seeking to chapter:', error);
      }
    }
  };

  // Fetch OTP when videoId changes
  useEffect(() => {
    // Reset initialization flag when video changes
    initializedRef.current = false;

    const fetchOtp = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/video/vdocipher-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching OTP: ${response.status}`);
        }

        const data = await response.json();
        if (!data.otp || !data.playbackInfo) {
          throw new Error('Invalid OTP response');
        }

        setOtpData(data);
      } catch (err) {
        console.error('Error fetching OTP:', err);
        setError(err instanceof Error ? err : new Error('Failed to load video data'));
        setIsLoading(false);
      }
    };

    fetchOtp();

    // Clean up any previous player instance
    return () => {
      clearEventListeners();

      // Clear any polling intervals
      if (checkPlayerIntervalRef.current) {
        clearInterval(checkPlayerIntervalRef.current);
        checkPlayerIntervalRef.current = null;
      }

      // Reset refs
      playerInstanceRef.current = null;
      initializedRef.current = false;
    };
  }, [videoId]);

  // Create and initialize iframe when OTP is available
  useEffect(() => {
    if (!otpData || !containerRef.current) return;

    // Only create the iframe if it doesn't exist
    if (!iframeRef.current) {
      // Create the iframe with OTP data - without auto settings in URL
      const embedCode = `<iframe src="https://player.vdocipher.com/v2/?otp=${otpData.otp}&playbackInfo=${encodeURIComponent(otpData.playbackInfo)}" style="border:0;width:100%;height:100%;" allowfullscreen="true" allow="encrypted-media; autoplay; fullscreen;"></iframe>`;
      containerRef.current.innerHTML = embedCode;

      iframeRef.current = containerRef.current.querySelector('iframe');
    }

    if (!iframeRef.current) {
      setError(new Error('Failed to create iframe'));
      setIsLoading(false);
      return;
    }

    // Setup iframe onload handler
    const iframe = iframeRef.current;
    const handleIframeLoad = () => {
      // Start polling for VdoPlayer availability
      if (checkPlayerIntervalRef.current) {
        clearInterval(checkPlayerIntervalRef.current);
      }

      let attempts = 0;
      const maxAttempts = 20; // 10 seconds total with 500ms interval

      checkPlayerIntervalRef.current = window.setInterval(() => {
        attempts++;

        if (window.VdoPlayer) {
          clearInterval(checkPlayerIntervalRef.current as number);
          checkPlayerIntervalRef.current = null;
          initializePlayer();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkPlayerIntervalRef.current as number);
          checkPlayerIntervalRef.current = null;
          console.error('VdoPlayer API not available after maximum attempts');
          setError(new Error('Video player failed to initialize'));
          setIsLoading(false);
        }
      }, 500);
    };

    // Initialize player with full handling of VdoPlayer availability
    const initializePlayer = () => {
      try {
        // Skip if we've already initialized for this otpData
        if (initializedRef.current) return;

        if (!window.VdoPlayer || !iframe) {
          return;
        }

        const player = window.VdoPlayer.getInstance(iframe);
        if (!player) {
          throw new Error('Failed to get player instance');
        }

        playerInstanceRef.current = player;
        initializedRef.current = true;

        // Store in external ref if provided
        if (externalPlayerRef && 'current' in externalPlayerRef) {
          (externalPlayerRef as React.MutableRefObject<any>).current = player;
        }

        // Clear any existing event listeners first
        clearEventListeners();

        // Set up event handlers if player.video is available
        if (player.video) {
          // Handle play event
          if (onPlay) {
            const playHandler = () => onPlay();
            player.video.addEventListener('play', playHandler);
            eventHandlersRef.current.play = playHandler;
          }

          // Handle pause event
          if (onPause) {
            const pauseHandler = () => onPause();
            player.video.addEventListener('pause', pauseHandler);
            eventHandlersRef.current.pause = pauseHandler;
          }

          // Handle ended event
          if (onEnded) {
            const endedHandler = () => onEnded();
            player.video.addEventListener('ended', endedHandler);
            eventHandlersRef.current.ended = endedHandler;
          }

          // Function to update progress in the database
          const updateProgress = async (currentTime: number) => {
            if (!userId || !courseId || !duration) return;

            // Calculate progress percentage
            const progressPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);

            try {
              console.log('Tracking progress...');
              const response = await fetch('/api/courses/progress/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  courseId,
                  progress: progressPercentage,
                }),
              });

              if (!response.ok) {
                console.error('Failed to update progress:', await response.text());
              }
              console.log('response : ', response);
            } catch (error) {
              console.error('Error updating progress:', error);
            }
          };

          // Handle timeupdate event with debounced progress updates
          const timeUpdateHandler = () => {
            const newTime = player.video.currentTime;
            setCurrentTime(newTime);

            if (onTimeUpdate) {
              onTimeUpdate(newTime);
            }

            // Update progress with debouncing (every 5 seconds)
            if (userId && courseId && duration) {
              const timeSinceLastUpdate = Date.now() - lastProgressUpdateRef.current;
              if (timeSinceLastUpdate >= 5000) {
                // 5 seconds
                lastProgressUpdateRef.current = Date.now();
                updateProgress(newTime);
              }
            }
          };
          player.video.addEventListener('timeupdate', timeUpdateHandler);
          eventHandlersRef.current.timeupdate = timeUpdateHandler;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing player:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize player'));
        setIsLoading(false);
      }
    };

    iframe.onload = handleIframeLoad;

    // If iframe is already loaded, call the handler directly
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      if (iframe) {
        iframe.onload = null;
      }

      if (checkPlayerIntervalRef.current) {
        clearInterval(checkPlayerIntervalRef.current);
        checkPlayerIntervalRef.current = null;
      }
    };
  }, [otpData, externalPlayerRef, onPlay, onPause, onEnded, onTimeUpdate, onChapterSeek]);

  // Effect for applying player settings when available
  useEffect(() => {
    // Skip if player is not initialized
    if (!playerInstanceRef.current?.video || !initializedRef.current) return;

    try {
      const player = playerInstanceRef.current;

      // Apply settings via player API instead of through URL parameters
      if (autoPlay && player.video && !player.video.paused) {
        player.video.play().catch((err: Error) => {
          console.warn('Autoplay prevented by browser:', err);
        });
      }

      if (muted && player.video) {
        player.video.muted = true;
      }

      if (loop && player.video) {
        player.video.loop = true;
      }
    } catch (err) {
      console.error('Error applying player settings:', err);
    }
  }, [autoPlay, muted, loop]);

  return (
    <div className="w-full">
      {/* Video Player Container */}
      <div className="relative">
        <div
          ref={containerRef}
          className={`aspect-video w-full ${className}`}
          data-testid="vdo-player-container"
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="p-5 text-center text-white">
              <h3 className="mb-2 text-xl font-bold">Error loading video</h3>
              <p className="mb-4 text-gray-300">{error.message}</p>
              <button
                className="rounded bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="font-medium">Loading video player...</p>
            </div>
          </div>
        )}
      </div>

      {/* Chapters Section */}
      {chapters && chapters.length > 0 && (
        <div className="mt-6" data-testid="chapters-section">
          <ChapterList
            chapters={chapters}
            currentTime={currentTime}
            onChapterClick={handleChapterSeek}
            isLoading={isLoading}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default VdoCipherPlayer;
