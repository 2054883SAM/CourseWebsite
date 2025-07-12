import React from 'react';
// Import the client component
import { MuxPlayer } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';

export const metadata = {
  title: 'Video Player Demo',
  description: 'Demo page for the Mux video player component',
};

export default function VideoPlayerDemo() {
  // Replace with your actual Mux playback ID
  const demoPlaybackId = 'FDIZSneWt00Xg5C25lWF79VVbBvcEWnAEANb9WHqEsks';

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Video Player Demo</h1>
      
      <div className="max-w-3xl mx-auto">
        <ClientOnly fallback={
          <div className="aspect-video bg-gray-200 animate-pulse mb-8 rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-gray-500">Loading video player...</p>
          </div>
        }>
          <MuxPlayer
            playbackId={demoPlaybackId}
            title="Demo Video"
            muted={true}
            autoPlay={false}
            className="mb-8 rounded-lg shadow-lg"
          />
        </ClientOnly>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About This Component</h2>
          <p className="mb-4">
            This is a demonstration of the MuxPlayer component that integrates the Mux Player SDK.
            The component includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Basic video playback functionality</li>
            <li>Loading indicator during video initialization</li>
            <li>Error handling with user-friendly messages</li>
            <li>Responsive design that maintains aspect ratio</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 