'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface VdoCipherPlayerProps {
  videoId: string;
  className?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
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
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  playerRef: externalPlayerRef,
}) => {
  // Create a container ref
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [otpData, setOtpData] = useState<{otp: string, playbackInfo: string} | null>(null);
  const eventHandlersRef = useRef<{[key: string]: any}>({});
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
      Object.keys(eventHandlersRef.current).forEach(event => {
        const handler = eventHandlersRef.current[event];
        if (handler) {
          playerInstanceRef.current.video.removeEventListener(event, handler);
        }
      });
    }
    eventHandlersRef.current = {};
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
          
          // Handle timeupdate event
          if (onTimeUpdate) {
            const timeUpdateHandler = () => onTimeUpdate(player.video.currentTime);
            player.video.addEventListener('timeupdate', timeUpdateHandler);
            eventHandlersRef.current.timeupdate = timeUpdateHandler;
          }
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
  }, [otpData, externalPlayerRef, onPlay, onPause, onEnded, onTimeUpdate]);

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
    <div className="relative">
      <div 
        ref={containerRef} 
        className={`w-full aspect-video ${className}`}
        data-testid="vdo-player-container"
      />
      
      {error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-5">
            <h3 className="text-xl font-bold mb-2">Error loading video</h3>
            <p className="text-gray-300 mb-4">{error.message}</p>
            <button 
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {isLoading && !error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-medium">Loading video player...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VdoCipherPlayer;