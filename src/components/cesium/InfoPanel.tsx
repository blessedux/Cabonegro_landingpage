'use client'

import { useEffect, useState } from 'react'
import type { Waypoint } from '@/lib/cesium/waypoints'

interface InfoPanelProps {
  waypoint: Waypoint | null
  locale: string
  onClose: () => void
}

function getLabel(wp: Waypoint, locale: string): string {
  switch (locale) {
    case 'es': return wp.labelEs
    case 'zh': return wp.labelZh
    case 'fr': return wp.labelFr
    default: return wp.labelEn
  }
}

function getDescription(wp: Waypoint, locale: string): string {
  const desc = wp.description as Record<string, string>
  return desc[locale] ?? desc.en
}

export default function InfoPanel({ waypoint, locale, onClose }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (waypoint) {
      // Tiny delay so the entry animation triggers after mount
      const t = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [waypoint])

  if (!waypoint) return null

  return (
    <div
      className="absolute bottom-8 right-0 z-10 pointer-events-none flex justify-end"
      style={{ paddingRight: 24 }}
    >
      <div
        className="pointer-events-auto rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          maxWidth: 320,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
        }}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-1.5">
              Cabo Negro
            </p>
            <h3 className="text-white text-base font-medium leading-snug">
              {getLabel(waypoint, locale)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 text-white/30 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/8" />

        {/* Description */}
        <p className="px-5 py-4 text-white/55 text-[13px] leading-relaxed">
          {getDescription(waypoint, locale)}
        </p>

        {/* Coordinates */}
        <div className="px-5 pb-5 flex items-center gap-4">
          <span className="text-white/25 text-[11px] font-mono">
            {Math.abs(waypoint.latitude).toFixed(4)}°{waypoint.latitude < 0 ? 'S' : 'N'}
          </span>
          <span className="text-white/15 text-[11px]">·</span>
          <span className="text-white/25 text-[11px] font-mono">
            {Math.abs(waypoint.longitude).toFixed(4)}°{waypoint.longitude < 0 ? 'W' : 'E'}
          </span>
        </div>
      </div>
    </div>
  )
}
