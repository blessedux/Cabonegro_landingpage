'use client'

import AmChartGlobePreloader from '@/components/ui/amchart-globe-preloader'
import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'
import PreloaderTopographicCenterBlur from '@/components/ui/PreloaderTopographicCenterBlur'

interface ExploreLoadingSurfaceProps {
  /** Secondary line (e.g. terrain loading status) */
  subtitle?: string
  globeSpin?: 'east' | 'west'
}

/**
 * Same visual language as PreloaderB (topo + globe) for explore route chunk load and Cesium init.
 */
export default function ExploreLoadingSurface({
  subtitle,
  globeSpin = 'west',
}: ExploreLoadingSurfaceProps) {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col bg-white"
      style={{ position: 'absolute', inset: 0 }}
    >
      <PreloaderTopographicBackdrop isFadingOut={false} />
      <PreloaderTopographicCenterBlur isFadingOut={false} />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 72%)',
        }}
      />
      <div className="absolute inset-0 z-[40] flex items-center justify-center">
        <div className="relative z-[50] w-full max-w-2xl px-6 sm:px-10">
          <AmChartGlobePreloader spin={globeSpin} />
          <p className="mt-10 text-center text-xs uppercase tracking-[0.24em] text-black/70 sm:text-sm">
            Loading Cabo Negro
          </p>
          {subtitle ? (
            <p className="mt-2 text-center text-[11px] tracking-widest text-black/45">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
