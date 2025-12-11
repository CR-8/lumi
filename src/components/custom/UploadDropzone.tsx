'use client';

import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
}

export function UploadDropzone({ onFileSelected, isUploading = false }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    []
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelected(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <Card className="relative overflow-hidden bg-surface border-border shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <img src={preview} alt="Preview" className="w-full h-auto max-h-[500px] object-contain bg-black/5" />
          
          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium">Processing...</p>
              </div>
            </div>
          )}
          
          <Button
            variant="secondary"
            size="icon"
            onClick={clearPreview}
            className="absolute top-4 right-4 rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
            aria-label="Remove image"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        </Card>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border hover:border-primary/50 hover:bg-secondary/50",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isUploading}
            aria-label="Upload image file"
          />
          <div className="flex flex-col items-center gap-6 transition-transform duration-300 group-hover:-translate-y-1">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              isDragging ? "bg-primary/20 scale-110" : "bg-secondary group-hover:bg-primary/10"
            )}>
              {isDragging ? (
                <Upload className="w-10 h-10 text-primary animate-bounce" />
              ) : (
                <ImageIcon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xl font-semibold text-foreground">
                {isUploading ? 'Analyzing your design...' : 'Drop your UI image here'}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Support for PNG, JPG. We'll analyze accessibility, colors, contrast, and layout instantly.
              </p>
            </div>
            <Button variant="outline" className="mt-2 pointer-events-none rounded-full px-6">
              Browse Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
