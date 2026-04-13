'use client'

import { useState } from 'react'
import PreloaderB from '@/components/ui/preloader-b'
import AmChartGlobePreloader from '@/components/ui/amchart-globe-preloader'
import PreloaderTopographicBackdrop from '@/components/ui/PreloaderTopographicBackdrop'
import PreloaderTopographicCenterBlur from '@/components/ui/PreloaderTopographicCenterBlur'

/**
 * Dev-only route to tune the globe preloader (spin, size, layout).
 * Visit: /en/preloader-globe-test (or your default locale).
 */
export default function PreloaderGlobeTestPage() {
  const [mode, setMode] = useState<'globe-only' | 'full-preloader'>('globe-only')
  const [spin, setSpin] = useState<'east' | 'west'>('west')
  const [globeKey, setGlobeKey] = useState(0)
  const [showFullPreloader, setShowFullPreloader] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="fixed top-4 left-4 z-[100000] max-w-sm rounded-lg border border-white/10 bg-black/80 p-4 text-sm backdrop-blur-sm">
        <h2 className="mb-3 font-semibold text-white">Globe preloader lab</h2>
        <div className="space-y-3">
          <div>
            <span className="mb-1 block text-neutral-400">View</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('globe-only')}
                className={`rounded px-2 py-1 ${mode === 'globe-only' ? 'bg-white text-black' : 'bg-white/10'}`}
              >
                Globe only
              </button>
              <button
                type="button"
                onClick={() => setMode('full-preloader')}
                className={`rounded px-2 py-1 ${mode === 'full-preloader' ? 'bg-white text-black' : 'bg-white/10'}`}
              >
                Full PreloaderB
              </button>
            </div>
          </div>
          <div>
            <span className="mb-1 block text-neutral-400">Spin</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSpin('east')
                  setGlobeKey((k) => k + 1)
                }}
                className={`rounded px-2 py-1 ${spin === 'east' ? 'bg-emerald-600' : 'bg-white/10'}`}
              >
                Eastward
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpin('west')
                  setGlobeKey((k) => k + 1)
                }}
                className={`rounded px-2 py-1 ${spin === 'west' ? 'bg-emerald-600' : 'bg-white/10'}`}
              >
                Westward
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGlobeKey((k) => k + 1)}
            className="w-full rounded bg-white/15 py-1.5 text-white hover:bg-white/25"
          >
            Remount globe
          </button>
          {mode === 'full-preloader' && (
            <button
              type="button"
              onClick={() => setShowFullPreloader((v) => !v)}
              className="w-full rounded bg-amber-600/90 py-1.5 text-white hover:bg-amber-500"
            >
              {showFullPreloader ? 'Hide' : 'Show'} full-screen preloader
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Matches production styling: white canvas, centered globe, caption below.
        </p>
      </div>

      {mode === 'globe-only' && (
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-black">
          <PreloaderTopographicBackdrop isFadingOut={false} />
          <PreloaderTopographicCenterBlur isFadingOut={false} />
          <div className="relative z-[40] flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-2xl px-6 sm:px-10">
              <AmChartGlobePreloader key={globeKey} spin={spin} />
              <p className="mt-10 text-center text-xs uppercase tracking-[0.24em] text-black/70 sm:text-sm">
                Loading Cabo Negro
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === 'full-preloader' && (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-800 p-8 text-center text-neutral-300">
          <p className="max-w-md">
            Toggle the full-screen overlay to verify z-index, fade, and layout with the real{' '}
            <code className="rounded bg-black/40 px-1">PreloaderB</code> shell.
          </p>
          {showFullPreloader && (
            <PreloaderB
              key={`full-${globeKey}-${spin}`}
              shouldAutoHide={false}
              inline={false}
              globeSpin={spin}
              onComplete={() => {}}
            />
          )}
        </div>
      )}
    </div>
  )
}
