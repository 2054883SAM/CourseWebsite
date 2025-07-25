// Server component - no 'use client' directive here
import React from 'react';
import VideoPlayerClient from './video-player-client';

// Metadata can be exported from server components
export const metadata = {
  title: 'Video Player',
  description: 'Watch your course video',
};

interface VideoPlayerPageProps {
  searchParams: Promise<{
    playbackId?: string;
    courseId?: string;
    courseTitle?: string;
  }>;
}

export default async function VideoPlayerPage({ searchParams }: VideoPlayerPageProps) {
  const { playbackId, courseId, courseTitle } = await searchParams;
  const demoPlaybackId = 'FDIZSneWt00Xg5C25lWF79VVbBvcEWnAEANb9WHqEsks';
  const finalPlaybackId = playbackId || demoPlaybackId;

  return (
    <VideoPlayerClient 
      playbackId={finalPlaybackId}
      courseId={courseId}
      courseTitle={courseTitle ? decodeURIComponent(courseTitle) : undefined}
    />
  );
}
