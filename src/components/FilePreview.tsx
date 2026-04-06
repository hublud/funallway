"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

/**
 * A reusable component to handle image file previews with memory-safe URL management.
 */
export default function FilePreview({ file, onRemove, className = "" }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // Basic validation to ensure it's an image
    if (!file.type.startsWith('image/')) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Free memory when component is unmounted or file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) return null;

  return (
    <div className={`relative group rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm transition-all hover:shadow-md animate-in zoom-in duration-200 ${className}`}>
      <img
        src={preview}
        alt={file.name}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 shadow-xl transform scale-75 group-hover:scale-100 transition duration-200"
          title="Remove image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* File name indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-md px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <p className="text-[10px] text-white truncate font-black uppercase tracking-tighter text-center">
          {file.name}
        </p>
      </div>
    </div>
  );
}
