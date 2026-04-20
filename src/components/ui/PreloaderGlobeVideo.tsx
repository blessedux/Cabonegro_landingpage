'use client'

import { useEffect, useRef } from 'react'

/** Ring in 100×100 viewBox; matches AmChartGlobePreloader / PreloaderNavRingOnly. */
const R = 47
/** Globe sits inside the ring with even margin (same as amCharts preloader). */
const GLOBE_DIAMETER_PCT = 72

interface PreloaderGlobeVideoProps {
  className?: string
  globeSpin?: 'east' | 'west'
  /** Pause decode + compositing when overlay drains heavy work. */
  suspended?: boolean
  /** Prefer 360p for weakest devices; 480p slightly sharper. */
  variant?: '360p' | '480p'
}

export default function PreloaderGlobeVideo({
  className = '',
  globeSpin = 'west',
  suspended = false,
  variant = '360p',
}: PreloaderGlobeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (suspended) {
      el.pause()
    } else {
      void el.play().catch(() => {
        /* autoplay policies — ring still spins */
      })
    }
  }, [suspended])

  const src = variant === '480p' ? '/globe_480p_preloader.mp4' : '/globe_360p_preloader.mp4'

  return (
    <div
      className={`relative z-[50] mx-auto aspect-square w-full max-w-[min(92vw,260px)] ${className}`}
      aria-label="Loading"
      role="status"
      aria-live="polite"
    >
      <div
        className="absolute left-1/2 top-1/2 z-[10] aspect-square -translate-x-1/2 -translate-y-[calc(50%+2px)] overflow-hidden rounded-full"
        style={{ width: `${GLOBE_DIAMETER_PCT}%`, maxWidth: `${GLOBE_DIAMETER_PCT}%` }}
      >
        {/*
         * Unmount the <video> element entirely when suspended. Pausing alone
         * keeps the decoder + GPU textures resident, which on low-end devices
         * holds ~20–40 MB of video memory while the preloader is idle.
         * The ring SVG below keeps the "loading" affordance visible.
         */}
        {!suspended && (
          <video
            ref={videoRef}
            className="h-full w-full object-cover object-center"
            src={src}
            muted
            playsInline
            loop
            preload="metadata"
            aria-hidden
          />
        )}
      </div>

      {/*
       * Spinner ring split into two layers so the rotating arc lives on an HTML
       * element. HTML `transform` is reliably promoted to its own compositor
       * layer, which means the ring keeps ticking even while the main thread is
       * busy hydrating the homepage. Animating `stroke-dasharray` used to be
       * the "pulse" — but that property is paint-bound and was the primary
       * cause of the spinner freezing on low-end devices during boot.
       */}
      <div className="preloader-globe-spinner-island pointer-events-none absolute inset-0 z-[25] text-black">
        {/* Static background ring */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={2.25} />
        </svg>
        {/* Rotating arc: HTML wrapper owns the transform so the compositor animates it */}
        <div
          className="preloader-globe-spinner-rotor absolute inset-0"
          style={globeSpin === 'east' ? { animationDirection: 'reverse' } : undefined}
          aria-hidden
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.48}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeDasharray="90 300"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
