'use client'

/**
 * Same ring + layout as the AmCharts globe preloader, without canvas/WebGL or amcharts.
 * Used during in-app navigations so heavy route chunks + chart init don’t starve the main thread
 * and freeze CSS animations on the overlay.
 */
const R = 44

export default function PreloaderNavRingOnly({ globeSpin = 'west' }: { globeSpin?: 'east' | 'west' }) {
  return (
    <div
      className="relative z-[50] mx-auto aspect-square w-full max-w-[min(92vw,260px)]"
      aria-label="Loading"
      role="status"
      aria-live="polite"
    >
      <svg
        className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 text-black"
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
      {/* Soft globe silhouette — no canvas */}
      <div className="pointer-events-none absolute left-[8.5%] right-[8.5%] top-[3%] bottom-[12%] z-[15] flex items-center justify-center">
        <div
          className="h-[78%] w-[78%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.85) 38%, rgba(148,163,184,0.45) 72%, rgba(100,116,139,0.35) 100%)',
            boxShadow: 'inset 0 -4px 14px rgba(15,23,42,0.12), inset 0 2px 8px rgba(255,255,255,0.75)',
          }}
        />
      </div>
    </div>
  )
}
