"use client";

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import types only
import type { MuxPlayerProps } from '@mux/mux-player-react';
// Import error handling utility
import { setupErrorSuppression } from '@/lib/utils/errorHandling';

// Dynamically import the Mux Player component with no SSR
const MuxPlayerReact = dynamic(
  () => import('@mux/mux-player-react').then(mod => mod.default),
  { ssr: false }
);

export interface MuxVideoPlayerProps extends Omit<MuxPlayerProps, 'onError' | 'onLoadStart' | 'onLoadedData'> {
  title: string;
  className?: string;
}

const MuxPlayer: React.FC<MuxVideoPlayerProps> = ({
  playbackId,
  title,
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // We're now using global error suppression via ErrorSuppressor component
  // No need for local error suppression here

  const handleError = useCallback((evt: CustomEvent) => {
    // Don't log the error here as we're already suppressing it
    setError(new Error('Video playback error'));
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback((evt: CustomEvent) => {
    setIsLoading(true);
    setError(null);
  }, []);

  const handleLoadedData = useCallback((evt: CustomEvent) => {
    setIsLoading(false);
  }, []);

  // Custom metadata for tracking
  const metadata = {
    video_title: title,
    player_name: 'Course Website Player',
    ...props.metadata,
  };

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      {isLoading && (
        <div 
          data-testid="video-loading-indicator"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div 
          data-testid="video-error-message"
          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10 p-4 text-white"
        >
          <p className="text-lg font-semibold mb-2">Unable to load video</p>
          <p className="text-sm opacity-80">Please try again later or contact support if the issue persists.</p>
        </div>
      )}
      
      <MuxPlayerReact
        playbackId={playbackId}
        metadata={metadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        style={{ height: '100%', width: '100%' }}
        streamType="on-demand"
        {...props}
      />
    </div>
  );
};

export default MuxPlayer; 