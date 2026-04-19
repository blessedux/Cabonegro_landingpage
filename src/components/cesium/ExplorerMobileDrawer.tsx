'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Waypoint } from '@/lib/cesium/waypoints'

function getLabel(wp: Waypoint, locale: string): string {
  switch (locale) {
    case 'es':
      return wp.labelEs
    case 'zh':
      return wp.labelZh
    case 'fr':
      return wp.labelFr
    default:
      return wp.labelEn
  }
}

const LOCALE_LABELS: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'Explore', subtitle: 'Choose a location — the camera flies to the pin' },
  es: { title: 'Explorar', subtitle: 'Elige un lugar — la cámara vuela al punto' },
  zh: { title: '探索', subtitle: '选择地点 — 相机飞向该航点' },
  fr: { title: 'Explorer', subtitle: 'Choisissez un lieu — la caméra vole vers le point' },
}

const COMPASS_HINTS: Record<string, string> = {
  en: 'Left-drag: pan · Right-drag: rotate & tilt · Pinch: zoom · Scroll (desktop menu): waypoints',
  es: 'Arrastrar izq.: desplazar · Arrastrar der.: girar e inclinar · Pellizco: zoom',
  zh: '左拖：平移 · 右拖：旋转与俯仰 · 双指：缩放',
  fr: 'Glisser gauche : panoramique · Glisser droit : rotation & inclinaison · Pincement : zoom',
}

type ExplorerMobileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  waypoints: Waypoint[]
  activeWaypoint: Waypoint | null
  isFlying: boolean
  locale: string
  onSelectWaypoint: (waypoint: Waypoint) => void
}

export default function ExplorerMobileDrawer({
  open,
  onOpenChange,
  waypoints,
  activeWaypoint,
  isFlying,
  locale,
  onSelectWaypoint,
}: ExplorerMobileDrawerProps) {
  const labels = LOCALE_LABELS[locale] ?? LOCALE_LABELS.en
  const compassHint = COMPASS_HINTS[locale] ?? COMPASS_HINTS.en

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  return (
    <AnimatePresence mode="sync">
      {open ? (
        <>
          <motion.button
            key="explore-m-backdrop"
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="explore-m-panel"
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            className="fixed inset-y-0 left-0 z-[70] flex w-full max-w-md flex-col md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              background: 'rgba(10, 15, 26, 0.97)',
              boxShadow: '8px 0 48px rgba(0,0,0,0.55)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Cabo Negro</p>
                <h2 className="text-white text-lg font-medium tracking-wide">{labels.title}</h2>
                <p className="text-white/45 text-xs mt-1 leading-snug max-w-[280px]">{labels.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80"
                aria-label="Close"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {waypoints.map((wp) => {
                const isActive = activeWaypoint?.id === wp.id
                return (
                  <button
                    type="button"
                    key={wp.id}
                    onClick={() => {
                      onSelectWaypoint(wp)
                      onOpenChange(false)
                    }}
                    className={[
                      'w-full text-left px-5 py-4 transition-colors duration-200 flex items-center gap-3 border-b border-white/5',
                      isActive ? 'bg-white/12 text-white' : 'text-white/65 active:bg-white/8',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'w-2 h-2 rounded-full flex-shrink-0',
                        isActive ? 'bg-cyan-300 scale-110' : 'bg-white/35',
                      ].join(' ')}
                    />
                    <span className="text-[15px] font-light leading-tight">{getLabel(wp, locale)}</span>
                  </button>
                )
              })}
            </nav>

            {isFlying ? (
              <div className="border-t border-white/10 px-5 py-3 flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                <span className="text-white/40 text-[11px]">Scene…</span>
              </div>
            ) : null}

            <div className="border-t border-white/10 px-5 py-4 shrink-0">
              <p className="text-white/35 text-[11px] leading-relaxed">{compassHint}</p>
            </div>

            <div className="border-t border-white/10 px-5 py-5 shrink-0">
              <p className="text-center text-white/45 text-[13px] font-medium tracking-[0.35em] uppercase">
                Cabonegro
              </p>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
