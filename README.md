# Free Client-Side Image Compressor

A free, open-source, privacy-focused image compressor by **[Unfoundscape](https://unfoundscape.cyou)**, developed and maintained by **[Unfoundid](https://github.com/UnfoundidHQ)**.

Compress JPG, JPEG, PNG, WebP, and BMP images directly in your browser. No accounts, no paywalls, no file uploads, and no server-side image processing.

Your images stay on your device.

---

## Features

- **100% Client-Side Processing** — Image decoding, rendering, compression, and preview generation happen locally in your browser.
- **Privacy-Focused** — Image files are not uploaded to a remote server for processing.
- **Multiple Image Formats** — Supports JPG, JPEG, PNG, WebP, and BMP input.
- **Original Format Preservation** — Keep the original image format or convert to JPG, PNG, or WebP.
- **Adjustable Compression Quality** — Fine-tune quality from 20% to 95% in 5% increments.
- **Automatic Image Optimization** — Attempts to reduce file size while preserving acceptable visual quality.
- **Smart Size Protection** — In Original mode, retains the original file when re-encoding produces a larger result.
- **Dimension Protection** — Limits extremely large image dimensions to 2560px to help reduce browser memory usage.
- **Live Image Preview** — Compare original and optimized images side by side.
- **Compression Statistics** — View original size, optimized size, dimensions, output format, and percentage reduction.
- **Instant Download** — Download the optimized image directly to your device.
- **Light & Dark Theme** — Supports both light and dark interfaces.
- **No Account Required** — Use the tool without registration or login.
- **Free to Use** — No subscription, paywall, or daily usage quota.

## Why Client-Side Compression?

Traditional online image compressors often require users to upload images to remote servers.

This project takes a different approach.

Images are processed using browser-native technologies such as HTML5 Canvas. This means image processing can happen locally without sending image files to an external compression server.

Benefits include:

- Better control over image privacy.
- No image-upload waiting time.
- No server-side image processing costs.
- Images remain on the user's device.
- Can work offline after the application has been loaded, provided its required assets are available.

## Supported Formats

| Format | Input | Output |
|---|---|---|
| JPG / JPEG | Yes | Yes |
| PNG | Yes | Yes |
| WebP | Yes | Yes |
| BMP | Yes | Depends on selected output format |

**Note:** BMP is supported as an input format. The browser Canvas API does not natively provide BMP encoding, so BMP images are exported in a supported output format.

## Tech Stack

- **React 19** — User interface.
- **TypeScript** — Type-safe development.
- **Vite** — Development server and production bundler.
- **Tailwind CSS v4** — Styling and responsive design.
- **HTML5 Canvas** — Image rendering and compression.
- **Lucide React** — Icons.
- **FileSaver.js** — File download handling.

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js (LTS recommended)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/UnfoundidHQ/Free-Client-Side-Image-Compressor-Unfoundscape.git
```

Navigate to the project directory:

```bash
cd Free-Client-Side-Image-Compressor-Unfoundscape
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### TypeScript Check

```bash
npm run typecheck
```

### Production Build

```bash
npm run build
```

## How to Use

1. Open the Image Compressor application.
2. Drag and drop an image into the upload area or select an image from your device.
3. The application automatically detects the original image format.
4. Choose `Original`, `JPG`, `PNG`, or `WebP` as the output format.
5. Adjust the compression quality using the slider.
6. Compare the original and optimized image previews.
7. Review the compression statistics.
8. Click **Download Compressed Image** to save the result.

## How It Works

### 1. Image Decoding

The application uses the browser's native `Image` API to decode the uploaded image.

### 2. Canvas Rendering

The decoded image is rendered onto an HTML5 Canvas element.

For JPEG output, transparent regions are filled with a white background before encoding.

### 3. Image Compression

The Canvas `toBlob()` API generates the optimized image.

- JPEG and WebP use the selected quality setting.
- PNG uses browser-native PNG encoding.
- The application attempts a more aggressive quality pass when appropriate.

### 4. Size Comparison

The application compares the original and resulting file sizes to calculate the percentage reduction.

### 5. Download

The resulting Blob is downloaded locally using FileSaver.js.

## Privacy

Privacy is a core design principle of Unfoundscape.

- Image files are processed locally in the browser.
- Image content is not intentionally uploaded to an image-processing server.
- No external image-compression API is required.
- Users do not need an account.
- The application does not require users to submit their images to a remote service.

**Important:** Browser-level behavior, hosting infrastructure, analytics, and other website integrations may have separate network activity. Client-side image processing does not automatically mean the entire website makes zero network requests.

## Browser Compatibility

Designed for modern browsers supporting:

- HTML5 Canvas
- Canvas `toBlob()`
- JavaScript Blob API
- Object URLs
- Modern React applications

Recommended browsers:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Apple Safari
- Opera

Actual format encoding support may vary between browsers.

## Project Structure

```text
Free-Client-Side-Image-Compressor-Unfoundscape/
│
├── public/
├── src/
│   ├── components/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── LICENSE
```

*The structure above is illustrative; actual files may differ.*

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

To contribute:

1. Fork this repository.
2. Create a new branch.
3. Make your changes.
4. Test your implementation.
5. Submit a Pull Request with a clear description.

Please ensure that contributions preserve the project's privacy-focused, client-side processing approach.

## License

This project is released under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

## Credits

**Developed and maintained by [Unfoundid](https://github.com/UnfoundidHQ).**

Part of the **[Unfoundscape](https://unfoundscape.cyou)** ecosystem.

Website: https://unfoundscape.cyou

GitHub Organization: https://github.com/UnfoundidHQ

---

**Free. Private. Browser-based. Open Source.**

If you find this project useful, consider giving it a star on GitHub.

