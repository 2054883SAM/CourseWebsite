'use client';

import { useEffect, useRef, useState } from 'react';

interface VdoCipherPlayerProps {
  videoId: string;
  watermark?: string;
  className?: string;
}

export default function VdoCipherPlayer({ videoId, watermark, className }: VdoCipherPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasInitialized = useRef(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // This ensures the video is loaded ONCE and never reloaded unless the page refreshes
  useEffect(() => {
    if (hasInitialized.current || !videoId) return;

    const fetchOtpAndLoadPlayer = async () => {
      try {
        const res = await fetch('/api/video/vdocipher-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoId }),
        });

        if (!res.ok) {
          console.error('Failed to fetch VdoCipher OTP', await res.text());
          return;
        }

        const { otp, playbackInfo } = await res.json();

        const watermarkParam = watermark
          ? `&watermark=${encodeURIComponent(
              `text:${watermark},opacity:0.5,size:14,pos:top-right`
            )}`
          : '';

        const playerUrl = `https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}${watermarkParam}`;

        setEmbedUrl(playerUrl);
        hasInitialized.current = true;
      } catch (error) {
        console.error('Error loading video player:', error);
      }
    };

    fetchOtpAndLoadPlayer();
  }, [videoId, watermark]); // watermark is only used on first mount

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full items-center justify-center text-gray-500">
        Loading secure video...
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ aspectRatio: '16 / 9', border: 'none' }}
        allowFullScreen
        allow="encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      ></iframe>
    </div>
  );
}
