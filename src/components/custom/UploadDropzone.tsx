'use client';

import { useState } from 'react';
import { ImageUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
}

export function UploadDropzone({ onFileSelected, isUploading = false }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) onFileSelected(file);
      }}
      className={cn(
        // children ignore pointer events so dragging across them doesn't fire dragleave
        'flex cursor-pointer flex-col items-center gap-6 rounded-lg border bg-tile-2 px-6 py-16 *:pointer-events-none',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-focus',
        isDragging ? 'border-primary-on-dark' : 'border-white/15',
        isUploading && 'pointer-events-none opacity-50'
      )}
    >
      <input
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />
      <span className="btn-icon">
        <ImageUp className="size-5" aria-hidden />
      </span>
      <span className="space-y-2">
        <span className="block text-tagline">
          {isUploading ? 'Analyzing your design…' : 'Drop your UI image here'}
        </span>
        <span className="block text-caption text-on-dark-muted">
          PNG or JPG. Lumi checks accessibility, color, contrast, and layout.
        </span>
      </span>
      <span className="btn-primary">Choose file</span>
    </label>
  );
}
