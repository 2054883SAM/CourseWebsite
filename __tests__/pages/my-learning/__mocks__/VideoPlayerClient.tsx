import React from 'react';

interface VideoPlayerClientProps {
  playbackId: string;
  courseId?: string;
  courseTitle?: string;
}

function VideoPlayerClient({ playbackId, courseId, courseTitle }: VideoPlayerClientProps) {
  return (
    <div data-testid="video-player" data-playback-id={playbackId} data-course-id={courseId}>
      <h1>{courseTitle}</h1>
    </div>
  );
}

export default VideoPlayerClient; 