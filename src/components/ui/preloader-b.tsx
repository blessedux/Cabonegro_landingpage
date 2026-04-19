'use client'

import { usePreloader } from '@/contexts/PreloaderContext'
import PreloaderGlobeVideo from '@/components/ui/PreloaderGlobeVideo'
import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'
import PreloaderTopographicCenterBlur from '@/components/ui/PreloaderTopographicCenterBlur'
import { usePreloaderFade } from '@/components/ui/hooks/usePreloaderFade'

interface PreloaderBProps {
  onComplete?: () => void
  duration?: number
  className?: string
  /** Absolute positioning instead of fixed (used when nested in a page). */
  inline?: boolean
  /**
   * If false, preloader waits for an explicit parent hide signal (e.g. route
   * change, language switch). Default keeps the old "parent-controlled" flow.
   */
  shouldAutoHide?: boolean
  globeSpin?: 'east' | 'west'
  /** Hydration boot: show visuals, skip internal timers; parent hides us. */
  bootOnly?: boolean
  /** Pause video globe; CSS ring spinner continues. */
  suspended?: boolean
}

const BASE_STYLE = {
  backgroundColor: '#ffffff',
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  // Sits above the fixed navbar (100000) so the overlay covers chrome.
  zIndex: 100003,
}

export default function PreloaderB({
  onComplete,
  duration = 0.8,
  className = '',
  inline = false,
  shouldAutoHide = false,
  globeSpin = 'west',
  bootOnly = false,
  suspended = false,
}: PreloaderBProps) {
  const { preloaderDrainHeavy } = usePreloader()
  const { isVisible, isFadingOut } = usePreloaderFade({
    bootOnly,
    inline,
    shouldAutoHide,
    duration,
    onComplete,
  })

  // Keep mounted through the fade so we don't snap to a white gap; unmount
  // only when fully invisible and not animating.
  if (!isVisible && !isFadingOut) return null

  const surfaceClass =
    `preloader-b-surface ${preloaderDrainHeavy ? 'preloader-b-drain-heavy' : ''} ` +
    `${inline ? 'absolute' : 'fixed'} inset-0 ${inline ? 'z-50' : 'z-[100003]'} ` +
    `bg-white transition-opacity duration-1000 ease-in-out ` +
    `${isFadingOut ? 'opacity-0' : 'opacity-100'} ${className}`

  return (
    <div
      className={surfaceClass}
      style={{
        ...BASE_STYLE,
        pointerEvents: isFadingOut || !isVisible ? 'none' : 'auto',
      }}
    >
      <PreloaderTopographicBackdrop
        isFadingOut={isFadingOut}
        pauseLineAnimation={preloaderDrainHeavy}
      />
      <PreloaderTopographicCenterBlur isFadingOut={isFadingOut} />
      {/* Light vignette — keeps topo contours readable without an opaque white wash. */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, transparent 72%)',
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 1000ms ease-in-out',
        }}
      />
      <div className="absolute inset-0 z-[40] flex items-center justify-center">
        <div
          className="relative z-[50] w-full px-6 sm:px-10 max-w-2xl transition-opacity duration-1000 ease-in-out"
          style={{ opacity: isFadingOut ? 0 : 1 }}
        >
          <PreloaderGlobeVideo
            globeSpin={globeSpin}
            suspended={suspended || preloaderDrainHeavy || isFadingOut}
          />
          <p className="mt-10 text-center text-xs sm:text-sm uppercase tracking-[0.24em] text-black/70">
            Loading Cabo Negro
          </p>
        </div>
      </div>
    </div>
  )
}
