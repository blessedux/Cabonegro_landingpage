'use client'

/**
 * Full-viewport "vintage satellite downlink" overlay.
 * pointer-events: none — sits above the Cesium canvas, below all HUD chrome.
 *
 * Layers (bottom → top):
 *   1. Film grain   — SVG feTurbulence with native <animate> seed cycling (no JS per-frame)
 *   2. Scanlines    — repeating CSS gradient, 1 px band every 3 px
 *   3. Vignette     — radial gradient, dark edges → transparent centre
 *   4. Phosphor tint — very faint green wash that reads as "old CRT / satellite monitor"
 */
export default function VintageOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
    >
      {/* ── Film grain ────────────────────────────────────────────────────────── */}
      {/*
       * SVG feTurbulence with a native <animate> cycling the seed attribute
       * gives authentic frame-to-frame grain without JS rAF overhead.
       * The grain rect is rendered at low opacity so it reads as analog noise.
       */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
        <svg
          width="100%"
          height="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <defs>
            <filter
              id="vnt-grain"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.72"
                numOctaves="4"
                result="noise"
              >
                <animate
                  attributeName="seed"
                  from="0"
                  to="80"
                  dur="0.09s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feColorMatrix type="saturate" values="0" in="noise" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#vnt-grain)" fill="white" />
        </svg>
      </div>

      {/* ── Scanlines ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* ── Vignette ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,0.60) 100%)',
        }}
      />

      {/* ── Phosphor tint ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8, 22, 6, 0.055)',
        }}
      />
    </div>
  )
}
