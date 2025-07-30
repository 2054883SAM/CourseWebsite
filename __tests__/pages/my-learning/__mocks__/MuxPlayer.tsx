import React from 'react';

export function MuxPlayer({ playbackId, title }: { playbackId: string, title?: string }) {
  return (
    <div data-testid="mux-player" data-playback-id={playbackId}>
      <h2>{title || 'Video Title'}</h2>
    </div>
  );
} 