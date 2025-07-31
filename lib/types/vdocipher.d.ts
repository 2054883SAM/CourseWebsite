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