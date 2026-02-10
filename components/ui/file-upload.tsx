"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileUp, X, Image as ImageIcon, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  preview?: boolean;
  value?: File[];
  onRemove?: (index: number) => void;
}

const FileUpload = ({
  onFileSelect,
  accept = "image/*",
  multiple = false,
  maxSize = 5,
  maxFiles = 5,
  className,
  disabled = false,
  label,
  helperText,
  error,
  preview = true,
  value = [],
  onRemove,
}: FileUploadProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Generate previews for image files
    const newPreviews: string[] = [];
    value.forEach((file) => {
      if (file.type.startsWith("image/")) {
        newPreviews.push(URL.createObjectURL(file));
      } else {
        newPreviews.push("");
      }
    });
    setPreviews(newPreviews);

    // Cleanup
    return () => {
      newPreviews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [value]);

  const validateFiles = (files: File[]): File[] => {
    return files.filter((file) => {
      // Check size
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds max size of ${maxSize}MB`);
        return false;
      }
      return true;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const validFiles = validateFiles(files);
    
    if (multiple) {
      const newFiles = [...value, ...validFiles].slice(0, maxFiles);
      onFileSelect(newFiles);
    } else {
      onFileSelect(validFiles.slice(0, 1));
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (multiple) {
      const newFiles = [...value, ...validFiles].slice(0, maxFiles);
      onFileSelect(newFiles);
    } else {
      onFileSelect(validFiles.slice(0, 1));
    }
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const newFiles = value.filter((_, i) => i !== index);
      onFileSelect(newFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground/80">{label}</label>
      )}

      <div
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-charcoal/50 p-6 transition-all duration-200",
          isDragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-error",
          "hover:border-primary/50 hover:bg-charcoal"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <FileUp className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {accept.replace(/,/g, ", ")} (max {maxSize}MB)
            </p>
          </div>
        </div>
      </div>

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {/* File previews */}
      {preview && value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative flex items-center gap-3 rounded-lg border border-border bg-charcoal p-3"
            >
              {previews[index] ? (
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-charcoal-50">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {multiple && value.length > 0 && value.length < maxFiles && (
        <p className="text-xs text-muted-foreground text-center">
          {value.length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
};

export { FileUpload };
