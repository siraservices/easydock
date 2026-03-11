"use client";

import { useRef, useState } from "react";

interface PhotoDropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  currentCount: number;
  maxCount: number;
}

export default function PhotoDropZone({
  onFiles,
  disabled = false,
  currentCount,
  maxCount,
}: PhotoDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const rawFiles = Array.from(e.dataTransfer.files);
    const imageFiles = rawFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    onFiles(imageFiles);
  }

  function handleClick() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const imageFiles = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    onFiles(imageFiles);
    // Reset input so the same file can be re-selected if removed
    e.target.value = "";
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Photo upload area. Drag photos here or click to browse."
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className={[
        "relative flex flex-col items-center justify-center",
        "rounded-lg border-2 border-dashed",
        "min-h-[120px] p-6 cursor-pointer",
        "transition-colors duration-150",
        isDragOver
          ? "border-teal-500 bg-teal-50"
          : "border-gray-300 hover:border-gray-400",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* All children use pointer-events-none to avoid drag-leave flicker */}
      <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M12 3v13m0-13l-3.75 3.75M12 3l3.75 3.75"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          Drag photos here or click to browse
        </p>
        <p className="text-xs text-gray-500">
          {currentCount}/{maxCount} photos &bull; Images only
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  );
}
