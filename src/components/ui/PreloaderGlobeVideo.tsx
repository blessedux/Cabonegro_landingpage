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
        className="absolute left-1/2 top-1/2 z-[10] aspect-square -translate-x-1/2 -translate-y-[calc(50%+2px)] overflow-hidden rounded-full bg-slate-100/80 shadow-inner"
        style={{ width: `${GLOBE_DIAMETER_PCT}%`, maxWidth: `${GLOBE_DIAMETER_PCT}%` }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-center opacity-[0.98]"
          style={{ opacity: suspended ? 0.35 : 0.98, transition: 'opacity 280ms ease' }}
          src={src}
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden
        />
      </div>

      <svg
        className="preloader-globe-spinner-island pointer-events-none absolute inset-0 z-[25] h-full w-full text-black"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <g transform="translate(50 50)">
          <circle cx="0" cy="0" r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={2.25} />
          <g
            className="animate-globe-spinner-arc-rotate"
            style={globeSpin === 'east' ? { animationDirection: 'reverse' } : undefined}
          >
            <circle
              className="animate-globe-spinner-arc-dash"
              cx="0"
              cy="0"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.48}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeDasharray="34 300"
              transform="rotate(-90)"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
