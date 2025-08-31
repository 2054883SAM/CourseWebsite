interface VdoCipherInstance {
  play: () => void;
  pause: () => void;
  destroy: () => void;
  mute?: () => void;
}

interface VdoPlayerApi {
  loadVideo: (params: { otp: string, playbackInfo: string }) => void;
}

interface VdoPlayerInstance {
  video: HTMLVideoElement;
  api: VdoPlayerApi;
}

// Database chapter type
export interface DBChapter {
  id: string;
  title: string;
  start_time: number; // in seconds
  duration?: number; // in seconds, optional
  description?: string;
  thumbnail_url?: string;
}

// Chapter types for VdoCipher Player
export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  duration?: number; // in seconds, optional
  description?: string;
  thumbnail?: string;
  flashcard?: boolean;
}

// Video Section interface for course creation
export interface VideoSection {
  id: string;
  title: string;
  videoFile: File | null;
  aiGeneratedChapters: boolean;
  chapters: VideoChapter[];
  uploadProgress: number;
  playbackId?: string;
  duration?: number;
  // Enhanced progress tracking
  status: 'pending' | 'uploading' | 'processing' | 'transcribing' | 'translating' | 'completed' | 'error';
  currentStep: string;
  error?: string;
}

export interface ChapterListProps {
  chapters: VideoChapter[];
  currentTime: number;
  onChapterClick: (chapter: VideoChapter) => void;
  className?: string;
  isLoading?: boolean;
  onFinish?: () => void;
}

declare global {
  interface Window {
    VdoPlayer: {
      getInstance: (iframe: HTMLIFrameElement) => VdoPlayerInstance;
    };
    vdoCipherScriptLoaded?: boolean;
    onVdoPlayerV2APIReady?: () => void;
  }
}

export {};