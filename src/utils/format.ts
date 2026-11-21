import type { DetectedFormatInfo } from '../types/compression';

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] as const;
const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/x-ms-bmp',
]);

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isSupportedImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type && SUPPORTED_MIME_TYPES.has(type)) {
    return true;
  }

  return SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function detectFormat(file: File): DetectedFormatInfo {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === 'image/png' || name.endsWith('.png')) {
    return { mime: 'image/png', ext: 'png', label: 'PNG' };
  }
  if (type === 'image/webp' || name.endsWith('.webp')) {
    return { mime: 'image/webp', ext: 'webp', label: 'WebP' };
  }
  if (
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg')
  ) {
    return { mime: 'image/jpeg', ext: 'jpg', label: 'JPG' };
  }
  if (type === 'image/bmp' || type === 'image/x-ms-bmp' || name.endsWith('.bmp')) {
    return { mime: 'image/bmp', ext: 'bmp', label: 'BMP' };
  }

  return { mime: 'image/jpeg', ext: 'jpg', label: 'JPG' };
}
