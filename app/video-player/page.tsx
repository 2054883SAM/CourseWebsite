'use client';

import React from 'react';
import { MuxPlayer } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';
import { withAuth } from '@/components/auth/withAuth';

export const metadata = {
  title: 'Video Player Demo',
  description: 'Demo page for the Mux video player component',
};

function VideoPlayerDemo() {
  // Replace with your actual Mux playback ID
  const demoPlaybackId = 'FDIZSneWt00Xg5C25lWF79VVbBvcEWnAEANb9WHqEsks';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Video Player Demo</h1>

      <div className="mx-auto max-w-3xl">
        <ClientOnly
          fallback={
            <div className="mb-8 flex aspect-video animate-pulse items-center justify-center rounded-lg bg-gray-200 shadow-lg">
              <p className="text-gray-500">Loading video player...</p>
            </div>
          }
        >
          <MuxPlayer
            playbackId={demoPlaybackId}
            title="Demo Video"
            muted={true}
            autoPlay={false}
            className="mb-8 rounded-lg shadow-lg"
          />
        </ClientOnly>

        <div>
          <h2 className="mb-4 text-xl font-semibold">About This Component</h2>
          <p className="mb-4">
            This is a demonstration of the MuxPlayer component that integrates the Mux Player SDK.
            The component includes:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Basic video playback functionality</li>
            <li>Loading indicator during video initialization</li>
            <li>Error handling with user-friendly messages</li>
            <li>Responsive design that maintains aspect ratio</li>
            <li>Progress tracking with automatic saving between sessions</li>
            <li>Visual progress bar with percentage indicator</li>
          </ul>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 text-lg font-semibold">Progress Tracking Features</h3>
            <ul className="list-disc space-y-2 pl-6 text-sm">
              <li>Your video progress is automatically saved as you watch</li>
              <li>Progress persists between page refreshes and browser sessions</li>
              <li>Progress is cleared when you finish watching the video</li>
              <li>Visual indicator shows your current position in the video</li>
              <li>Click on the progress bar to jump to a specific position</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component with authentication required
export default withAuth(VideoPlayerDemo, { requireAuth: true });
