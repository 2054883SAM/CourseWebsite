'use client';

import { useEffect, useRef, useState, memo } from 'react';
import Script from 'next/script';

import ChapterList from './ChapterList';
import { VideoChapter } from '@/lib/types/vdocipher';
import { normalizeChaptersToVideo } from '@/lib/utils/chapters';

// No global types needed, we'll use type assertions

interface VdoCipherPlayerProps {
  videoId: string;
  watermark?: string;
  className?: string;
  chapters?: VideoChapter[];
  userId?: string;
  courseId?: string;
  duration?: number;
  onChapterSeek?: (chapter: VideoChapter, time: number) => void;
}

function VdoCipherPlayerComponent({ videoId, watermark, className, chapters = [], userId, courseId, duration, onChapterSeek }: VdoCipherPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasInitialized = useRef(false);
  const playerLoaded = useRef(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const safeChapters: VideoChapter[] = normalizeChaptersToVideo(chapters);

  // This ensures the video is loaded ONCE and never reloaded unless the page refreshes
  useEffect(() => {
    if (hasInitialized.current || !videoId) return;
    
    // Mark as initialized immediately to prevent duplicate calls
    hasInitialized.current = true;
    
    const fetchOtpAndLoadPlayer = async () => {
      try {
        console.log('Fetching VdoCipher OTP for videoId:', videoId);
        
        const res = await fetch('/api/video/vdocipher-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId }),
        });

        if (!res.ok) {
          console.error('Failed to fetch VdoCipher OTP', await res.text());
          return;
        }

        const { otp, playbackInfo } = await res.json();

        const watermarkParam = watermark
          ? `&watermark=${encodeURIComponent(
              `text:${watermark},opacity:0.5,size:14,pos:top-right`
            )}`
          : '';

        const playerUrl = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}${watermarkParam}`;
        
        console.log('VdoCipher player initialized successfully');
        setEmbedUrl(playerUrl);
        
        // Store in sessionStorage to persist between rerenders
        try {
          sessionStorage.setItem(`vdoCipher_${videoId}`, playerUrl);
        } catch (e) {
          console.warn('Could not store player URL in sessionStorage:', e);
        }
      } catch (error) {
        console.error('Error loading video player:', error);
      }
    };

    // Try to get from sessionStorage first
    try {
      const cachedUrl = sessionStorage.getItem(`vdoCipher_${videoId}`);
      if (cachedUrl) {
        console.log('Retrieved player URL from sessionStorage');
        setEmbedUrl(cachedUrl);
        return;
      }
    } catch (e) {
      console.warn('Could not read from sessionStorage:', e);
    }

    fetchOtpAndLoadPlayer();
  }, [videoId, watermark]); // Dependencies minimal to prevent re-initialization

  // Second useEffect for player tracking with VdoPlayer API, will only run when embedUrl is available
  useEffect(() => {
    if (!embedUrl || !iframeRef.current) return;
    
    // Wait for iframe to load before initializing the player
    const handleIframeLoad = async () => {
      try {
        // Check if VdoPlayer API is available in the global scope
        if (!(window as any).VdoPlayer) {
          console.warn('VdoPlayer API not available yet, waiting...');
          return;
        }
        
        if (!iframeRef.current) {
          console.warn('iframe reference is not available');
          return;
        }
        
        console.log('Setting up VdoCipher player using VdoPlayer API');
        playerLoaded.current = true;
        
        const iframeElement = iframeRef.current; // Store reference for cleanup function
        const vdoPlayer = (window as any).VdoPlayer;
        const player = vdoPlayer.getInstance(iframeElement);
        
        // Fetch chapters metadata if not provided as props
        if ((!safeChapters || safeChapters.length === 0) && player.api) {
          try {
            // Using getMetaData as per VdoCipher docs
            const metadata = await player.api.getMetaData();
            if (metadata && metadata.chapters && metadata.chapters.length > 0) {
              console.log('Retrieved chapters from VdoCipher metadata:', metadata.chapters);
              // Note: We can't update chapters here as it's a prop
              // If needed, implement a state and callback to parent
            }
          } catch (e) {
            console.error('Error fetching VdoCipher metadata:', e);
          }
        }
        
        // Set up time tracking
        let timeUpdateInterval: NodeJS.Timeout | null = null;
        
        // Use the API to regularly check current time
        timeUpdateInterval = setInterval(() => {
          if (iframeElement && (window as any).VdoPlayer) {
            try {
              const vdoPlayer = (window as any).VdoPlayer;
              const player = vdoPlayer.getInstance(iframeElement);
              const currentTime = player.video.currentTime;
              
              setCurrentTime(currentTime);
              
              // If we have chapters, find the current chapter based on time
               if (safeChapters && safeChapters.length > 0) {
                 const currentChapter = safeChapters.find((chapter, index) => {
                   const nextChapter = safeChapters[index + 1];
                  return chapter.startTime <= currentTime && 
                    (!nextChapter || currentTime < nextChapter.startTime);
                });
                
                // If needed, we could trigger onChapterSeek when current chapter changes
                // This would allow for highlighting the active chapter
              }
            } catch (e) {
              console.error('Error getting currentTime from VdoPlayer API:', e);
            }
          }
        }, 1000);
        
        // Cleanup
        return () => {
          if (timeUpdateInterval) clearInterval(timeUpdateInterval);
        };
      } catch (error) {
        console.error('Error initializing VdoPlayer:', error);
      }
    };
    
    // Set a timeout to allow iframe and API to load
    const initTimeout = setTimeout(() => {
      handleIframeLoad();
    }, 1000);
    
    // Listen for iframe load event
    const currentIframe = iframeRef.current;
    if (currentIframe) {
      currentIframe.addEventListener('load', handleIframeLoad);
    }
    
    return () => {
      clearTimeout(initTimeout);
      if (currentIframe) {
        currentIframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [embedUrl, chapters, onChapterSeek, safeChapters]);

  const handleChapterClick = (chapter: VideoChapter) => {
    setIsLoading(true);
    
    try {
      // Access player through VdoPlayer API
      if (iframeRef.current && (window as any).VdoPlayer) {
        console.log(`Seeking to chapter at time: ${chapter.startTime}`);
        
        // Get a reference to the current iframe
        const iframeElement = iframeRef.current;
        if (!iframeElement) {
          throw new Error('Iframe element is null');
        }
        
        const vdoPlayer = (window as any).VdoPlayer;
        const player = vdoPlayer.getInstance(iframeElement);
        
        // Set the current time and play using the direct API
        player.video.currentTime = chapter.startTime;
        player.video.play();
        
        // Set currentTime immediately for better UX
        setCurrentTime(chapter.startTime);
        
        // Call external callback if provided
        if (onChapterSeek) {
          onChapterSeek(chapter, chapter.startTime);
        }
        
        // Set a fallback timeout to ensure loading state doesn't get stuck
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } else {
        console.error('Player iframe not available for seeking or VdoPlayer API not loaded');
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Error seeking to chapter:', e);
      setIsLoading(false);
    }
  };

  // This block is now handled in the playerContent variable below
  
  // We're using this technique to ensure the iframe doesn't get recreated on re-renders
  const playerContent = embedUrl ? (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      width="100%"
      height="100%"
      style={{ aspectRatio: '16 / 9', border: 'none' }}
      allowFullScreen
      allow="encrypted-media"
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      key={`player-${videoId}`} // This ensures the iframe only changes when videoId changes
    ></iframe>
  ) : (
    <div className="flex aspect-video w-full items-center justify-center text-gray-500">
      Loading secure video...
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Script src="https://player.vdocipher.com/v2/api.js" strategy="afterInteractive" />
      <div className="col-span-1 md:col-span-2">
        <div className={className}>
          {playerContent}
        </div>
      </div>
      {safeChapters && safeChapters.length > 0 && (
        <div className="col-span-1">
          <ChapterList
            chapters={safeChapters}
            currentTime={currentTime}
            onChapterClick={handleChapterClick}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
// This will only re-render when one of the props actually changes
const VdoCipherPlayer = memo(VdoCipherPlayerComponent, (prevProps, nextProps) => {
  // Return true if passing nextProps to render would return
  // the same result as passing prevProps to render,
  // otherwise return false
  
  // Compare only essential props that would affect rendering
  const sameVideoId = prevProps.videoId === nextProps.videoId;
  const sameWatermark = prevProps.watermark === nextProps.watermark;
  const sameCallback = prevProps.onChapterSeek === nextProps.onChapterSeek;
  
  // For chapters, we just check if both are arrays
  // and if their length is the same since we don't expect chapters to change often
  const sameChapterLength = 
    (!prevProps.chapters && !nextProps.chapters) || 
    (Array.isArray(prevProps.chapters) && 
     Array.isArray(nextProps.chapters) && 
     prevProps.chapters.length === nextProps.chapters.length);
  
  // If all key props are the same, we can skip re-rendering
  return sameVideoId && sameWatermark && sameChapterLength && sameCallback;
});

export default VdoCipherPlayer;
