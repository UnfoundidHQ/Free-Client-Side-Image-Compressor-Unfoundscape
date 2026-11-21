import { useState, useRef, useEffect, useCallback } from 'react';
import { saveAs } from 'file-saver';
import {
  Image as ImageIcon,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  Check,
} from 'lucide-react';
import { FileUploader } from './FileUploader';
import { Button } from './Button';
import { detectFormat, formatFileSize } from '../utils/format';
import type {
  CompressionNotice,
  CompressionStats,
  OutputFormatOption,
} from '../types/compression';

const MAX_DIMENSION = 2560;

function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

function loadImageDimensions(src: string): Promise<{ img: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error('Image has invalid dimensions (0×0).'));
        return;
      }
      resolve({ img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to decode image. Please check that the file is a valid JPG, PNG, WebP, or BMP image.'));
    img.src = src;
  });
}

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [notice, setNotice] = useState<CompressionNotice | null>(null);

  // Settings: Format and Quality (Defaults to original format & 80% quality)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormatOption>('original');
  const [quality, setQuality] = useState<number>(80);

  // Refs to prevent race conditions and guarantee Object URL cleanup
  const jobIdRef = useRef(0);
  const originalUrlRef = useRef<string | null>(null);
  const compressedUrlRef = useRef<string | null>(null);

  const setSafeOriginalUrl = useCallback((nextUrl: string | null) => {
    if (originalUrlRef.current && originalUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    originalUrlRef.current = nextUrl;
    setOriginalPreviewUrl(nextUrl);
  }, []);

  const setSafeCompressedUrl = useCallback((nextUrl: string | null) => {
    if (compressedUrlRef.current && compressedUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(compressedUrlRef.current);
    }
    compressedUrlRef.current = nextUrl;
    setCompressedPreviewUrl(nextUrl);
  }, []);

  // Revoke any active Object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      jobIdRef.current += 1;
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
        originalUrlRef.current = null;
      }
      if (compressedUrlRef.current) {
        URL.revokeObjectURL(compressedUrlRef.current);
        compressedUrlRef.current = null;
      }
    };
  }, []);

  const runCompressImage = useCallback(
    async (
      targetFile: File,
      origUrl: string,
      targetFormatOption: OutputFormatOption,
      qualityVal: number
    ) => {
      const currentJobId = ++jobIdRef.current;
      setIsProcessing(true);
      setNotice(null);

      try {
        const origFormatInfo = detectFormat(targetFile);

        let outputMime: string = origFormatInfo.mime;
        let outputExt: string = origFormatInfo.ext;
        let outputLabel: string = origFormatInfo.label;

        if (targetFormatOption === 'jpg') {
          outputMime = 'image/jpeg';
          outputExt = 'jpg';
          outputLabel = 'JPG';
        } else if (targetFormatOption === 'png') {
          outputMime = 'image/png';
          outputExt = 'png';
          outputLabel = 'PNG';
        } else if (targetFormatOption === 'webp') {
          outputMime = 'image/webp';
          outputExt = 'webp';
          outputLabel = 'WebP';
        }

        const { img, width: origW, height: origH } = await loadImageDimensions(origUrl);

        if (currentJobId !== jobIdRef.current) return;

        // Maintain dimensions; downscale only extreme resolutions (>2560px) to prevent memory crashes
        let targetW = origW;
        let targetH = origH;
        if (origW > MAX_DIMENSION || origH > MAX_DIMENSION) {
          if (origW >= origH) {
            targetW = MAX_DIMENSION;
            targetH = Math.round((origH * MAX_DIMENSION) / origW);
          } else {
            targetH = MAX_DIMENSION;
            targetW = Math.round((origW * MAX_DIMENSION) / origH);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          throw new Error('Could not create HTML5 Canvas 2D rendering context.');
        }

        // For JPEG, fill transparent background with pure white
        if (outputMime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        const normalizedQuality = Math.min(1.0, Math.max(0.1, qualityVal / 100));

        const resultBlob =
          outputMime === 'image/png'
            ? await canvasToBlobAsync(canvas, 'image/png')
            : await canvasToBlobAsync(canvas, outputMime, normalizedQuality);

        if (currentJobId !== jobIdRef.current) return;

        let finalBlob: Blob = resultBlob || targetFile;
        const finalW = targetW;
        const finalH = targetH;
        let nextNotice: CompressionNotice | null = null;

        // If output format matches original format and compressed blob turned out larger, retry or keep original
        if (targetFormatOption === 'original' && finalBlob.size >= targetFile.size) {
          if (outputMime === 'image/jpeg' || outputMime === 'image/webp') {
            const aggressiveQuality = Math.max(0.4, normalizedQuality * 0.8);
            const secondTry = await canvasToBlobAsync(canvas, outputMime, aggressiveQuality);
            if (currentJobId !== jobIdRef.current) return;

            if (secondTry && secondTry.size < targetFile.size) {
              finalBlob = secondTry;
            } else {
              finalBlob = targetFile;
              nextNotice = {
                type: 'info',
                message: `This ${origFormatInfo.label} image is already highly optimized. Original file preserved.`,
              };
            }
          } else {
            finalBlob = targetFile;
            nextNotice = {
              type: 'info',
              message: `This ${origFormatInfo.label} image is already at maximum efficiency. Original quality preserved.`,
            };
          }
        }

        // Handle browsers encoding canvas BMP fallback as PNG
        if (finalBlob !== targetFile && outputMime === 'image/bmp' && finalBlob.type === 'image/png') {
          outputExt = 'png';
          outputLabel = 'PNG';
        }

        const finalSize = finalBlob.size;
        const savings = Math.max(
          0,
          Math.round(((targetFile.size - finalSize) / targetFile.size) * 100)
        );

        const blobUrl = URL.createObjectURL(finalBlob);
        if (currentJobId !== jobIdRef.current) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        if (savings > 0) {
          nextNotice = {
            type: 'success',
            message:
              targetFormatOption === 'original'
                ? `Compressed successfully in original format (${outputLabel}): Reduced file size by ${savings}%.`
                : `Compressed and converted to ${outputLabel}: Reduced file size by ${savings}%.`,
          };
        }

        setSafeCompressedUrl(blobUrl);
        setCompressedBlob(finalBlob);
        setNotice(nextNotice);
        setStats({
          originalSize: targetFile.size,
          compressedSize: finalSize,
          savingsPct: savings,
          originalWidth: origW,
          originalHeight: origH,
          compressedWidth: finalW,
          compressedHeight: finalH,
          format: outputLabel,
          extension: outputExt,
        });
      } catch (err: unknown) {
        if (currentJobId !== jobIdRef.current) return;
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred during compression.';
        setNotice({ type: 'error', message });
      } finally {
        if (currentJobId === jobIdRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [setSafeCompressedUrl]
  );

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const selected = files[0];
    const origUrl = URL.createObjectURL(selected);

    setFile(selected);
    setSafeOriginalUrl(origUrl);
    setSafeCompressedUrl(null);
    setCompressedBlob(null);
    setStats(null);
    setNotice(null);

    void runCompressImage(selected, origUrl, selectedFormat, quality);
  };

  const handleReset = () => {
    jobIdRef.current += 1;
    setSafeOriginalUrl(null);
    setSafeCompressedUrl(null);
    setFile(null);
    setCompressedBlob(null);
    setStats(null);
    setNotice(null);
    setIsProcessing(false);
  };

  const handleFormatChange = (newFormat: OutputFormatOption) => {
    setSelectedFormat(newFormat);
    if (file && originalPreviewUrl) {
      void runCompressImage(file, originalPreviewUrl, newFormat, quality);
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    if (file && originalPreviewUrl) {
      void runCompressImage(file, originalPreviewUrl, selectedFormat, newQuality);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file || !stats) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image';
    saveAs(compressedBlob, `${baseName}_compressed.${stats.extension}`);
  };

  const origInfo = file ? detectFormat(file) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {!file ? (
        <FileUploader
          onFilesSelected={handleFilesSelected}
          label="Upload an image to compress (JPG, PNG, WebP, BMP)"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                <ImageIcon size={24} />
              </div>
              <div>
                <div className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                  {file.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span>
                    Original Size:{' '}
                    <strong className="text-neutral-700 dark:text-neutral-300">
                      {formatFileSize(file.size)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Format: {origInfo?.label}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw size={14} className="mr-1.5" /> Choose Different Image
            </Button>
          </div>

          {/* Format & Quality Settings Bar */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Format Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Output Format
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFormatChange('original')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedFormat === 'original'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {selectedFormat === 'original' && <Check size={12} />}
                    <span>Original ({origInfo?.label || 'Same'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('jpg')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedFormat === 'jpg'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    JPG / JPEG
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('png')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedFormat === 'png'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    PNG
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('webp')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedFormat === 'webp'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    WebP
                  </button>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="sm:w-64">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="compression-quality-slider"
                    className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1"
                  >
                    <Sliders size={12} /> Compression Quality
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {quality}%
                  </span>
                </div>
                <input
                  id="compression-quality-slider"
                  type="range"
                  min={20}
                  max={95}
                  step={5}
                  value={quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>Smaller file</span>
                  <span>Balanced</span>
                  <span>Best quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing state indicator */}
          {isProcessing && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30 text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>
                Compressing image in {stats?.format || origInfo?.label || 'original'} format...
              </span>
            </div>
          )}

          {/* Notice if any */}
          {notice && (
            <div
              role={notice.type === 'error' ? 'alert' : 'status'}
              className={`flex items-center gap-2 p-3.5 rounded-xl border text-xs ${
                notice.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/60'
                  : 'bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-200 dark:border-neutral-700'
              }`}
            >
              <AlertCircle
                className={`h-4 w-4 shrink-0 ${
                  notice.type === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              />
              <span>{notice.message}</span>
            </div>
          )}

          {/* Stats Card & Previews */}
          {stats && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-neutral-50 p-4 text-center dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                    Original Size
                  </div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {formatFileSize(stats.originalSize)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {stats.originalWidth}×{stats.originalHeight}px • {origInfo?.label}
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                  <div className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-400 mb-1">
                    Optimized Size
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatFileSize(stats.compressedSize)}
                  </div>
                  <div className="text-[10px] text-blue-500 mt-0.5">
                    {stats.compressedWidth}×{stats.compressedHeight}px •{' '}
                    <span className="font-bold underline uppercase">
                      {stats.format} (.{stats.extension})
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 mb-1">
                    Space Saved
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.savingsPct}% REDUCTION
                  </div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">
                    Saved {formatFileSize(Math.max(0, stats.originalSize - stats.compressedSize))}
                  </div>
                </div>
              </div>

              {/* Side-by-side Visual Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-neutral-500">
                    <span>Original Image ({origInfo?.label})</span>
                    <span>{formatFileSize(stats.originalSize)}</span>
                  </div>
                  <div className="relative aspect-video max-h-64 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 flex items-center justify-center">
                    {originalPreviewUrl && (
                      <img
                        src={originalPreviewUrl}
                        alt="Original preview"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={13} /> Optimized Image ({stats.format} • .{stats.extension})
                    </span>
                    <span>{formatFileSize(stats.compressedSize)}</span>
                  </div>
                  <div className="relative aspect-video max-h-64 overflow-hidden rounded-xl border border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-neutral-950 flex items-center justify-center">
                    {compressedPreviewUrl && (
                      <img
                        src={compressedPreviewUrl}
                        alt="Compressed preview"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Download & Reset Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={!compressedBlob || isProcessing}
                  className="w-full sm:w-96 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <Download size={18} className="mr-2" /> Download Compressed Image (.{stats.extension})
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw size={16} className="mr-2" /> Upload Another
                </Button>
              </div>
            </div>
          )}

          {/* Offline Privacy Notice */}
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/40 p-3.5 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <span>
              100% In-Browser Compression: Your images stay on your device ({origInfo?.label || 'JPG/PNG/WebP/BMP'}) and are never uploaded to any server.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
