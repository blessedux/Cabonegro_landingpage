'use client'

import type { Waypoint } from '@/lib/cesium/waypoints'

interface ExplorerControlsProps {
  waypoints: Waypoint[]
  activeWaypoint: Waypoint | null
  isFlying: boolean
  locale: string
  onSelectWaypoint: (waypoint: Waypoint) => void
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
  en: { title: 'Explore', subtitle: 'Select a location' },
  es: { title: 'Explorar', subtitle: 'Selecciona una ubicación' },
  zh: { title: '探索', subtitle: '选择一个位置' },
  fr: { title: 'Explorer', subtitle: 'Sélectionnez un lieu' },
}

export default function ExplorerControls({
  waypoints,
  activeWaypoint,
  isFlying,
  locale,
  onSelectWaypoint,
}: ExplorerControlsProps) {
  const labels = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en

  return (
    <div className="absolute left-0 top-0 bottom-0 z-10 flex flex-col justify-center pointer-events-none">
      <div
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
          <p className="text-white/40 text-[11px] mt-0.5">{labels.subtitle}</p>
        </div>

        {/* Waypoints list */}
        <div className="py-2">
          {waypoints.map((wp) => {
            const isActive = activeWaypoint?.id === wp.id
            return (
              <button
                key={wp.id}
                onClick={() => onSelectWaypoint(wp)}
                disabled={isFlying}
                className={[
                  'w-full text-left px-5 py-3 transition-all duration-200 flex items-center gap-3 group',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                  isFlying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
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

        {/* Flying indicator */}
        {isFlying && (
          <div className="px-5 py-3 border-t border-white/8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white/40 text-[11px]">Flying…</span>
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
          Left-drag: orbit · Scroll: zoom · Middle-drag: pan · Right-drag: tilt
        </p>
      </div>
    </div>
  )
}
