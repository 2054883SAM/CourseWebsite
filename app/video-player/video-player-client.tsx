'use client';

import React from 'react';
import { MuxPlayer } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';
import { withAuth } from '@/components/auth/withAuth';

interface VideoPlayerClientProps {
  demoPlaybackId: string;
}

function VideoPlayerClient({ demoPlaybackId }: VideoPlayerClientProps) {
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
        </div>
      </div>
    </div>
  );
}

export default withAuth(VideoPlayerClient, { requireAuth: true }); 