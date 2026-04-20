'use client'

import { memo, useEffect, useRef } from 'react'
import type { Waypoint } from '@/lib/cesium/waypoints'

interface ExplorerControlsProps {
  waypoints: Waypoint[]
  activeWaypoint: Waypoint | null
  isFlying: boolean
  locale: string
  onSelectWaypoint: (waypoint: Waypoint) => void
  /** Scroll wheel on the panel: -1 = previous waypoint, +1 = next (always flies in parent). */
  onNavigateWaypoints?: (direction: 1 | -1) => void
  /** 0–1 while a scene plays; fades with parent when user is idle during playback. */
  menuOpacity?: number
}

function getLabel(wp: Waypoint, locale: string): string {
  switch (locale) {
    case 'es': return wp.labelEs
    case 'zh': return wp.labelZh
    case 'fr': return wp.labelFr
    default: return wp.labelEn
  }
}

const LOCALE_LABELS: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'Explore', subtitle: 'Click or scroll the panel — camera flies between pins' },
  es: { title: 'Explorar', subtitle: 'Clic o scroll en el panel — la cámara vuela entre puntos' },
  zh: { title: '探索', subtitle: '点击或在面板内滚动 — 相机会在航点间飞行' },
  fr: { title: 'Explorer', subtitle: 'Clic ou défilement du panneau — la caméra vole entre les points' },
}

const COMPASS_HINTS: Record<string, string> = {
  en:
    'Scroll: move between waypoints · Left-drag: pan · Right-drag: rotate & tilt',
  es:
    'Scroll: moverse entre puntos · Arrastrar izq.: desplazar · Arrastrar der.: girar e inclinar',
  zh:
    '滚动：航点切换 · 左拖：平移 · 右拖：旋转与俯仰',
  fr:
    'Défilement : waypoints · Glisser gauche : panoramique · Glisser droit : rotation & inclinaison',
}

function wheelStepPx(): number {
  // One full viewport height per waypoint step.
  // Clamp avoids extremes on huge displays / tiny windows.
  return Math.max(260, Math.min(1200, Math.floor(window.innerHeight)))
}

const ExplorerControls = memo(function ExplorerControls({
  waypoints,
  activeWaypoint,
  isFlying,
  locale,
  onSelectWaypoint,
  onNavigateWaypoints,
  menuOpacity = 1,
}: ExplorerControlsProps) {
  const labels = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en
  const compassHint = COMPASS_HINTS[locale] ?? COMPASS_HINTS.en
  const panelRef = useRef<HTMLDivElement>(null)
  const wheelAccRef = useRef(0)

  useEffect(() => {
    const el = panelRef.current
    const nav = onNavigateWaypoints
    if (!el || !nav) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      wheelAccRef.current += e.deltaY
      if (Math.abs(wheelAccRef.current) < wheelStepPx()) return
      const dir = wheelAccRef.current > 0 ? 1 : -1
      wheelAccRef.current = 0
      nav(dir)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onNavigateWaypoints])

  return (
    <div
      className="absolute left-0 top-0 bottom-0 z-10 flex flex-col justify-center pointer-events-none transition-opacity duration-500 ease-out"
      style={{ opacity: menuOpacity }}
    >
      <div
        ref={panelRef}
        className="pointer-events-auto mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 15, 26, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          width: 220,
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/8">
          <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-1">
            Cabo Negro
          </p>
          <h2 className="text-white text-sm font-medium tracking-wide">
            {labels.title}
          </h2>
          <p className="text-white/40 text-[11px] mt-0.5 leading-snug">{labels.subtitle}</p>
        </div>

        {/* Waypoints list */}
        <div className="py-2">
          {waypoints.map((wp) => {
            const isActive = activeWaypoint?.id === wp.id
            return (
              <button
                type="button"
                key={wp.id}
                onClick={() => onSelectWaypoint(wp)}
                disabled={false}
                className={[
                  'w-full text-left px-5 py-3 transition-all duration-200 flex items-center gap-3 group',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                  'cursor-pointer',
                ].join(' ')}
              >
                {/* Dot indicator */}
                <span
                  className={[
                    'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200',
                    isActive ? 'bg-white scale-125' : 'bg-white/30 group-hover:bg-white/60',
                  ].join(' ')}
                />
                <span className="text-[13px] font-light leading-tight">
                  {getLabel(wp, locale)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Scene indicator (non-blocking) */}
        {isFlying && (
          <div className="px-5 py-2.5 border-t border-white/8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            <span className="text-white/35 text-[11px]">Scene (tap another waypoint to interrupt)</span>
          </div>
        )}
      </div>

      {/* Compass hint */}
      <div
        className="pointer-events-auto mx-4 mt-3 px-4 py-2.5 rounded-xl"
        style={{
          background: 'rgba(10, 15, 26, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          width: 220,
        }}
      >
        <p className="text-white/35 text-[10px] leading-relaxed">
          {compassHint}
        </p>
      </div>
    </div>
  )
})
export default ExplorerControls
