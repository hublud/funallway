"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, ExternalLink } from "lucide-react";
import { SliderItem } from "@/utils/pricing";

interface AdvertSliderProps {
  items: SliderItem[];
}

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

export default function AdvertSlider({ items }: AdvertSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || items.length === 0) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(((index % items.length) + items.length) % items.length);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, items.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-slide
  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    intervalRef.current = setInterval(next, AUTO_SLIDE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, next, items.length]);

  // Sync video mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, current]);

  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 mb-6">
        <div
          className="relative rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center gap-3 py-12 text-center"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-2xl">
              📺
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Ad Slider</p>
              <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs">
                Admin: go to <span className="font-bold text-blue-600">Settings → Ad Slider</span> and add your first Cloudinary image or video URL to activate this section.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 rounded-full border border-slate-200 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Content</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeItem = items[current];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-6">
      <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200/60 bg-black group">

        {/* Slides */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "3/4" }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ${
                idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="relative w-full h-full">
                {item.type === "video" ? (
                  <video
                    ref={idx === current ? videoRef : undefined}
                    src={item.url}
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || `Advertisement ${idx + 1}`}
                    className="w-full h-full object-contain"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                )}

                {/* Link layer - clickable area */}
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="absolute inset-0 z-20 cursor-pointer"
                    title={item.title || "Learn More"}
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Title label */}
                {item.title && (
                  <div className="absolute bottom-4 left-4 z-30 pointer-events-none">
                    <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10">
                      {item.title}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                {item.link && (
                  <a 
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 z-40 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    CLICK HERE TO CONNECT <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Mute toggle — only for videos */}
          {activeItem?.type === "video" && (
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          {/* Play / pause autoplay */}
          {items.length > 1 && (
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition"
              title={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-xl active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-xl active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Progress bar */}
        {isPlaying && items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-white/10">
            <div
              key={current}
              className="slider-progress h-full bg-white/70"
              style={{ animationDuration: `${AUTO_SLIDE_INTERVAL}ms` }}
            />
          </div>
        )}
      </div>

      {/* Item counter */}
      {items.length > 1 && (
        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
          {current + 1} / {items.length}
        </p>
      )}
    </div>
  );
}
