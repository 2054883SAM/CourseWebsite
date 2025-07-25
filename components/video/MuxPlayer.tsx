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
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const handleError = useCallback((evt: CustomEvent) => {
    setError(new Error('Erreur de lecture vidéo'));
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
    setIsPlaying(false);
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl bg-black">
        {isLoading && (
          <div
            data-testid="video-loading-indicator"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-75"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Chargement de la vidéo...</p>
              <p className="text-gray-300 text-sm mt-2">Veuillez patienter</p>
            </div>
          </div>
        )}

        {error && (
          <div
            data-testid="video-error-message"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-90 p-8 text-center text-white"
          >
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Impossible de charger la vidéo</h3>
            <p className="text-gray-300 mb-4">
              Une erreur s'est produite lors du chargement de la vidéo.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
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

        {/* Overlay avec informations de la vidéo */}
        {!isLoading && !error && (
          <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">En direct</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de progression améliorée */}
      {duration > 0 && (
        <div className="mt-4 px-2">
          <VideoProgress
            videoId={playbackId}
            duration={duration}
            currentTime={currentTime}
            onTimeUpdate={handleProgressUpdate}
            onVideoEnd={handleVideoEnd}
          />
          
          {/* Informations supplémentaires */}
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {formatTime(duration)}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                HD
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuxPlayer;
