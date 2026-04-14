"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getOptimizedUrl } from "@/utils/cloudinary";

interface ImageGalleryProps {
  images: string[];
  altPrefix: string;
  isFeatured?: boolean;
}

export default function ImageGallery({ images, altPrefix, isFeatured }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Stage - Reduced by 30% on mobile (w-full to w-[70%]) for better scroll experience */}
      <div className="relative aspect-[3/4] w-[70%] mx-auto sm:w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-100 group">
        <img 
          src={getOptimizedUrl(images[selectedIndex])}
          alt={`${altPrefix} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-top transition-all duration-500"
        />

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-md text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10">
            <Sparkles className="w-4 h-4" />
            <span>Featured</span>
          </div>
        )}

        {/* Navigation Arrows (Visible on hover or mobile) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-20 aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300 snap-center
                ${selectedIndex === idx 
                  ? 'ring-2 ring-blue-600 ring-offset-2 opacity-100' 
                  : 'opacity-60 hover:opacity-100 ring-1 ring-slate-200'
                }
              `}
            >
              <img 
                src={getOptimizedUrl(img)}
                alt={`${altPrefix} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
