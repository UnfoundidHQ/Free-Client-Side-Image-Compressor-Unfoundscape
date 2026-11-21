export type OutputFormatOption = 'original' | 'jpg' | 'png' | 'webp';

export interface DetectedFormatInfo {
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/bmp';
  ext: 'jpg' | 'png' | 'webp' | 'bmp';
  label: 'JPG' | 'PNG' | 'WebP' | 'BMP';
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savingsPct: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  format: string;
  extension: string;
}

export interface CompressionNotice {
  type: 'info' | 'success' | 'error';
  message: string;
}
