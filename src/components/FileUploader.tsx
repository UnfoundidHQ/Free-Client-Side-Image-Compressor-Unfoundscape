import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { isSupportedImageFile } from '../utils/format';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  label?: string;
}

export function FileUploader({
  onFilesSelected,
  accept = '.jpg,.jpeg,.png,.webp,.bmp,image/jpeg,image/png,image/webp,image/bmp',
  label = 'Upload an image to compress (JPG, PNG, WebP, BMP)',
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndEmit = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const selected = fileList[0];
    if (!isSupportedImageFile(selected)) {
      setValidationError(
        `Unsupported file "${selected.name}". Please upload a JPG, JPEG, PNG, WebP, or BMP image.`
      );
      return;
    }

    if (selected.size === 0) {
      setValidationError('The selected file is empty (0 bytes). Please choose a valid image.');
      return;
    }

    setValidationError(null);
    onFilesSelected([selected]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    validateAndEmit(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndEmit(e.target.files);
    // Reset input value so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
            : 'border-neutral-300 hover:border-blue-400 bg-white dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:border-blue-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3 sm:mb-4">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>

        <p className="text-center text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-200 px-2">
          {label}
        </p>

        <p className="mt-1 sm:mt-2 text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Drag & drop a file here, or click to browse (Single file, 100% local)
        </p>

        <Button
          variant="outline"
          className="mt-4 sm:mt-6"
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
        >
          Select Image
        </Button>
      </div>

      {validationError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/60 text-xs font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
