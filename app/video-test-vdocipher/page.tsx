'use client';

import { useState, useEffect, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { VdoCipherPlayer, VideoChapter } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VdoCipherTestPage() {
  // State for player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  // Type for player instance
  interface VdoCipherInstance {
    video: HTMLVideoElement;
    api?: {
      loadVideo: (params: { otp: string, playbackInfo: string }) => void;
    };
    destroy?: () => void;
    mute?: () => void;
    play?: () => Promise<void>;
    pause?: () => void;
  }
  
  // Create a stable ref directly for the VdoCipherInstance
  const playerRef = useRef<VdoCipherInstance | null>(null);
  // apiKey no longer needed for VdoCipher player

  // VdoCipher handles authentication via server-side OTP API

  // Video ID as specified in requirements
  const videoId = '0d08afbb3ebd7449eb6f9a61675d3923';

  // Test chapters for the video player
  const testChapters: VideoChapter[] = [
    {
      id: 'chapter-1',
      title: 'Introduction and Overview',
      startTime: 0,
      duration: 15,
      description: 'Welcome to VdoCipher and overview of DRM-protected video streaming features'
    },
    {
      id: 'chapter-2',
      title: 'Advanced Security Features',
      startTime: 15,
      duration: 39,
      description: 'Deep dive into VdoCipher\'s security measures including watermarking and analytics'
    }
  ];

  // Event handlers for the player
  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = (time: number) => {
    setVideoTime(time);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setVideoTime(0);
  };

  // Chapter seek handler
  const handleChapterSeek = (chapter: VideoChapter, seekTime: number) => {
    console.log(`Seeking to chapter: ${chapter.title} at ${seekTime}s`);
    setVideoTime(seekTime);
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageLayout>
      <Section className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              VdoCipher Video Player Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Testing the integration of VdoCipher&apos;s DRM-protected video player
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main video player */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden shadow-xl">
                <CardContent className="p-0">
                  <ClientOnly
                    fallback={
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading video player...</p>
                        </div>
                      </div>
                    }
                  >
                    {/* Key prop added to ensure React properly unmounts/remounts when videoId changes */}
                    <VdoCipherPlayer
                      key={videoId}
                      videoId={videoId}
                      title="VdoCipher Test Video"
                      chapters={testChapters}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                      onChapterSeek={handleChapterSeek}
                      playerRef={playerRef}
                    />
                  </ClientOnly>
                </CardContent>
              </Card>

              {/* Video information */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        VdoCipher Test Video
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Video ID: {videoId}
                      </p>
                    </div>
                  </div>

                  {/* Video playback information */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current playback time: {formatTime(videoTime)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {isPlaying ? 'Playing' : 'Paused'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with additional information */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* About VdoCipher */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About VdoCipher
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      VdoCipher provides secure video hosting with DRM protection. The player uses encrypted delivery and playback to prevent unauthorized downloads.
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Protection</span>
                        <span className="text-sm font-medium text-green-600">DRM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Format</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Encrypted MP4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Player</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">HTML5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test actions */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Test Actions
                    </h3>
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Reload Player
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          // Direct access to the player instance
                          if (playerRef.current?.video) {
                            try {
                              // Prevent state updates during play to avoid rerendering
                              const playPromise = playerRef.current.video.play();
                              if (playPromise !== undefined) {
                                playPromise.catch((error: Error) => {
                                  console.error('Error playing video:', error);
                                });
                              }
                            } catch (error) {
                              console.error('Could not play video:', error);
                            }
                          } else {
                            console.warn('Player reference not available yet. Current ref:', playerRef.current);
                          }
                        }}
                      >
                        Play
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          // Direct access to the player instance
                          if (playerRef.current?.video) {
                            try {
                              // Simple pause without logging to prevent unnecessary rerenders
                              playerRef.current.video.pause();
                            } catch (error) {
                              console.error('Could not pause video:', error);
                            }
                          } else {
                            console.warn('Player reference not available yet. Current ref:', playerRef.current);
                          }
                        }}
                      >
                        Pause
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}