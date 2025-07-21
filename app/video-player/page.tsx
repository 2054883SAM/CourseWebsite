// Server component - no 'use client' directive here
import React from 'react';
import VideoPlayerClient from './video-player-client';

// Metadata can be exported from server components
export const metadata = {
  title: 'Video Player Demo',
  description: 'Demo page for the Mux video player component',
};

export default function VideoPlayerPage() {
  // Replace with your actual Mux playback ID
  const demoPlaybackId = 'FDIZSneWt00Xg5C25lWF79VVbBvcEWnAEANb9WHqEsks';

  // Render the client component
  return <VideoPlayerClient demoPlaybackId={demoPlaybackId} />;
}
