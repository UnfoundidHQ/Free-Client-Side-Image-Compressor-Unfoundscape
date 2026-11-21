# Client-Side Image Compressor

A fast, privacy-first, 100% client-side image compression web application built with **React**, **TypeScript**, **Tailwind CSS**, and **HTML5 Canvas**.

All image decoding, resizing, re-encoding, and preview generation happen locally inside the user's browser—no files are ever uploaded to a server.

## Features

- **100% Client-Side Processing**: Zero server uploads, zero external API calls, works offline after initial page load.
- **Broad Input Support**: Accepts **JPG / JPEG**, **PNG**, **WebP**, and **BMP** images via drag-and-drop or file picker.
- **Smart Original Format Preservation**: Defaults to preserving your uploaded image format (`Original`), or lets you convert on the fly to **JPG**, **PNG**, or **WebP**.
- **Interactive Quality Control**: Adjust compression quality from `20%` to `95%` (in `5%` steps) with instant re-compression.
- **Automatic Size-Guard Optimization**:
  - Automatically falls back to a slightly lower quality pass if a re-encoded JPG/WebP is larger than the input.
  - Preserves the original file if it is already maximally optimized so compression never inflates file size in `Original` mode.
  - Safely caps extreme dimensions above `2560px` to protect browser memory.
- **Live Visual Comparison & Statistics**:
  - Original vs. Optimized size, pixel dimensions, output format, percentage reduction, and bytes saved.
  - Side-by-side image previews.
- **Memory-Safe Object URL Management**: Properly revokes previous and unmounted `URL.createObjectURL` references to prevent memory leaks.
- **One-Click Download & Theme Support**: Download compressed images via `file-saver` and toggle Light / Dark mode.

## Tech Stack

- **React 19** & **TypeScript** (strict mode enabled)
- **Vite** for fast development and production bundling
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **lucide-react** for crisp icons
- **file-saver** for reliable cross-browser downloads

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Run TypeScript type check
npm run typecheck

# 4. Build for production
npm run build
```

## Usage

1. Drag and drop a **JPG**, **PNG**, **WebP**, or **BMP** file into the upload zone (or click **Select Image**).
2. The image is compressed immediately in its original format at the default `80%` quality setting.
3. Optionally select a different **Output Format** (`Original`, `JPG / JPEG`, `PNG`, `WebP`) or adjust the **Compression Quality** slider (`20%` – `95%`).
4. Review the **Original Size**, **Optimized Size**, **Space Saved**, and side-by-side previews.
5. Click **Download Compressed Image** to save the optimized file locally.

## Technical Details

- **Decoding**: Browser-native `Image` decoding from an object URL with explicit error handling for corrupted or unsupported files.
- **Canvas Rendering**: Draws onto an offscreen `HTMLCanvasElement` (`2d` context). When targeting JPEG output, transparent regions are filled with `#ffffff` before encoding so alpha channels do not turn black.
- **Encoding**: Uses `canvas.toBlob(callback, mimeType, quality)`. PNG is encoded losslessly (stripping non-essential metadata), while JPEG and WebP use normalized quality `[0.1, 1.0]`.
- **Memory Lifecycle**: Every preview URL created via `URL.createObjectURL` is tracked in React refs and revoked with `URL.revokeObjectURL` whenever replaced, reset, or unmounted.

## Browser Support

Works in all modern evergreen browsers supporting HTML5 Canvas `toBlob` and WebP encoding (Chrome, Edge, Firefox, Safari, Opera).

## License

Released under the [MIT License](./LICENSE).
