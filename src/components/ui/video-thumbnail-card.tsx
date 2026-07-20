"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { getVideoThumbnail } from "@/lib/video-thumbnails";
import { VideoOverlay } from "@/components/ui/video-overlay";
import { getVimeoEmbedUrl } from "@/lib/vimeo";

type Props = {
  videoId: string;
  title: string;
  caption?: string;
  className?: string;
  eager?: boolean;
};

export function VideoThumbnailCard({
  videoId,
  title,
  caption,
  className,
  eager = false,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const thumb = getVideoThumbnail(videoId);
  const videoUrl = getVimeoEmbedUrl(videoId);

  return (
    <>
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={`group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black text-left ${className ?? ""}`}
        aria-label={`Play ${title}`}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1414] via-[#070D0D] to-[#1a3a38]" />
        )}
        <div className="absolute inset-0 thumb-scrim" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#45A29E] text-white shadow-lg transition-transform group-hover:scale-105 md:h-20 md:w-20">
            <Play className="ml-1 h-8 w-8 fill-white md:h-9 md:w-9" />
          </span>
        </div>
        {caption ? (
          <p className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 text-center text-sm font-bold text-white drop-shadow-lg md:text-base">
            {caption}
          </p>
        ) : null}
      </button>

      {playing ? (
        <VideoOverlay videoUrl={videoUrl} title={title} onClose={() => setPlaying(false)} />
      ) : null}
    </>
  );
}
