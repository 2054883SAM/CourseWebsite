'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import types only
import type { MuxPlayerProps } from '@mux/mux-player-react';
// Import error handling utility
import { setupErrorSuppression } from '@/lib/utils/errorHandling';
import { VideoProgress } from './VideoProgress';

// Dynamically import the Mux Player component with no SSR
const MuxPlayerReact = dynamic(() => import('@mux/mux-player-react').then((mod) => mod.default), {
  ssr: false,
});

export interface MuxVideoPlayerProps
  extends Omit<
    MuxPlayerProps,
    'onError' | 'onLoadStart' | 'onLoadedData' | 'onTimeUpdate' | 'onEnded'
  > {
  title: string;
  className?: string;
  playbackId: string; // Make playbackId required and string
}

const MuxPlayer: React.FC<MuxVideoPlayerProps> = ({
  playbackId,
  title,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleError = useCallback((evt: CustomEvent) => {
    setError(new Error('Video playback error'));
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback((evt: CustomEvent) => {
    setIsLoading(true);
    setError(null);
  }, []);

  const handleLoadedData = useCallback((evt: CustomEvent) => {
    setIsLoading(false);
    // Get video duration from the event target
    const video = evt.target as HTMLVideoElement;
    setDuration(video.duration);
  }, []);

  const handleTimeUpdate = useCallback((evt: CustomEvent) => {
    const video = evt.target as HTMLVideoElement;
    setCurrentTime(video.currentTime);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setCurrentTime(0);
  }, []);

  const handleProgressUpdate = useCallback((time: number) => {
    // Seek to the saved time
    const video = document.querySelector('mux-player') as any;
    if (video) {
      video.currentTime = time;
    }
  }, []);

  // Custom metadata for tracking
  const metadata = {
    video_title: title,
    player_name: 'Course Website Player',
    ...props.metadata,
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
        {isLoading && (
          <div
            data-testid="video-loading-indicator"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white sm:h-12 sm:w-12"></div>
          </div>
        )}

        {error && (
          <div
            data-testid="video-error-message"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4 text-center text-white"
          >
            <p className="mb-2 text-base font-semibold sm:text-lg">Unable to load video</p>
            <p className="text-xs opacity-80 sm:text-sm">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        )}

        <MuxPlayerReact
          playbackId={playbackId}
          metadata={metadata}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          style={{ height: '100%', width: '100%' }}
          streamType="on-demand"
          className="h-full w-full"
          {...props}
        />
      </div>

      {duration > 0 && (
        <div className="mt-2 px-1 sm:mt-3 sm:px-2">
          <VideoProgress
            videoId={playbackId}
            duration={duration}
            currentTime={currentTime}
            onTimeUpdate={handleProgressUpdate}
            onVideoEnd={handleVideoEnd}
          />
        </div>
      )}
    </div>
  );
};

export default MuxPlayer;
