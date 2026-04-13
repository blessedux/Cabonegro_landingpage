'use client'

import { TOPOGRAPHIC_PRELOADER_SVG } from '@/components/ui/topographic-preloader-svg'

interface PreloaderTopographicBackdropProps {
  isFadingOut: boolean
  /** Pause expensive stroke-dash animations (last moments before overlay hides). */
  pauseLineAnimation?: boolean
  /**
   * Stretch the SVG to the full scroll height of the page (top-aligned).
   * Default preloader mode centers a ~100vh-tall graphic — that leaves white gaps on long pages.
   */
  fullPage?: boolean
}

/** CodePen coffeecircle/YqdWpW topographic line animation — adapted for a white preloader canvas */
export default function PreloaderTopographicBackdrop({
  isFadingOut,
  pauseLineAnimation = false,
  fullPage = false,
}: PreloaderTopographicBackdropProps) {
  return (
    <div
      className={`preloader-topographic pointer-events-none z-0 transition-opacity duration-1000 ease-in-out isolate ${
        pauseLineAnimation ? 'preloader-topographic--drain ' : ''
      }${
        fullPage
          ? 'preloader-topographic--full-page fixed'
          : 'absolute inset-0 flex items-center justify-center overflow-hidden'
      }`}
      style={{ opacity: isFadingOut ? 0 : 1 }}
      aria-hidden
      // eslint-disable-next-line react/no-danger -- static SVG from CodePen export
      dangerouslySetInnerHTML={{ __html: TOPOGRAPHIC_PRELOADER_SVG }}
    />
  )
}
