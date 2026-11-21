import { useEffect, useState } from 'react';
import { Image as ImageIcon, Moon, ShieldCheck, Sun } from 'lucide-react';
import { ImageCompressor } from './components/ImageCompressor';

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = window.localStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      {/* Header */}
      <header className="border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ImageIcon size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                Image Compressor
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                100% Client-Side Browser Optimizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={14} />
              Zero Server Uploads
            </span>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        <section className="max-w-4xl mx-auto space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Compress Images Without Leaving Your Browser
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Reduce file size for JPG, PNG, WebP, and BMP images locally using HTML5 Canvas while preserving your original format or converting on the fly.
          </p>
        </section>

        <section>
          <ImageCompressor />
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            How It Works
          </h3>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            <li className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-200/70 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-200 block mb-0.5">
                1. Upload JPG, PNG, WebP, or BMP
              </strong>
              Drag and drop or browse any supported image directly from your device.
            </li>
            <li className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-200/70 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-200 block mb-0.5">
                2. Format-Preserving Compression
              </strong>
              Detects the original format by default and never bloats already-optimized files.
            </li>
            <li className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-200/70 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-200 block mb-0.5">
                3. Real-Time Quality & Format Control
              </strong>
              Adjust quality from 20% to 95% or switch output between Original, JPG, PNG, and WebP.
            </li>
            <li className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 border border-neutral-200/70 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-200 block mb-0.5">
                4. Inspect & Download Locally
              </strong>
              Compare original vs. optimized size, dimensions, savings percentage, and preview before saving.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800 py-5 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Open-source under the MIT License • Runs 100% locally in your browser
      </footer>
    </div>
  );
}

export default App;
