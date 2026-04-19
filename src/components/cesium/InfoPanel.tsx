'use client'

import { memo, useEffect, useState } from 'react'
import type { Waypoint } from '@/lib/cesium/waypoints'
import { pickExploreCard } from '@/lib/cesium/exploreCardText'
import { getParcelExploreCard } from '@/lib/cesium/exploreParcelNarratives'

export interface ParcelSalePick {
  title: string
  longitude: number
  latitude: number
  /** Planar estimate from polygon outer ring minus holes (hectares). */
  areaHa?: number
  /** KML `<Placemark><name>` — drives parcel narrative copy. */
  kmlRawName?: string
}

interface InfoPanelProps {
  waypoint: Waypoint | null
  parcelSale: ParcelSalePick | null
  locale: string
  closable?: boolean
}

function getLabel(wp: Waypoint, locale: string): string {
  switch (locale) {
    case 'es': return wp.labelEs
    case 'zh': return wp.labelZh
    case 'fr': return wp.labelFr
    default: return wp.labelEn
  }
}

function getWaypointCardText(wp: Waypoint, locale: string) {
  return pickExploreCard(wp.description, locale)
}

const EXPAND_LABEL: Record<string, string> = {
  en: 'Expand info panel',
  es: 'Expandir panel',
  zh: '展开信息',
  fr: 'Développer le panneau',
}

function CollapsedFab({
  variant,
  locale,
  visible,
  onExpand,
}: {
  variant: 'parcel' | 'waypoint'
  locale: string
  visible: boolean
  onExpand: () => void
}) {
  const expandLabel = EXPAND_LABEL[locale] ?? EXPAND_LABEL.en
  const border =
    variant === 'parcel' ? '1px solid rgba(0, 229, 255, 0.22)' : '1px solid rgba(255,255,255,0.12)'
  const shell = {
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    opacity: visible ? 1 : 0,
    transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
  } as const
  return (
    <div
      className="absolute bottom-8 right-0 z-10 pointer-events-none flex justify-end"
      style={{ paddingRight: 24 }}
    >
      <div className="pointer-events-auto flex items-center justify-end" style={shell}>
        <button
          type="button"
          aria-label={expandLabel}
          onClick={onExpand}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full select-none"
          style={{
            background: 'rgba(10, 15, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border,
            boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 16V8m0 0l-3.5 3.5M12 8l3.5 3.5M7 20h10a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-2.828-2.828A2 2 0 0013.172 4H7a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke={variant === 'parcel' ? 'rgba(0, 229, 255, 0.85)' : 'rgba(255,255,255,0.65)'}
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

const InfoPanel = memo(function InfoPanel({ waypoint, parcelSale, locale, closable = true }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (waypoint || parcelSale) {
      const t = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [waypoint, parcelSale])

  useEffect(() => {
    setExpanded(false)
    setCollapsed(false)
  }, [waypoint, parcelSale])

  if (!waypoint && !parcelSale) return null

  if (parcelSale) {
    const parcelCard = pickExploreCard(getParcelExploreCard(parcelSale.kmlRawName), locale)
    const areaLine =
      locale === 'es'
        ? 'Área (estimada, perímetro exterior − huecos)'
        : locale === 'zh'
          ? '面积（估算，外环减孔洞）'
          : locale === 'fr'
            ? 'Surface (estimée, contour − trous)'
            : 'Area (estimate: outer ring − holes)'

    if (collapsed && closable) {
      return (
        <CollapsedFab
          variant="parcel"
          locale={locale}
          visible={visible}
          onExpand={() => setCollapsed(false)}
        />
      )
    }

    return (
      <div
        className="absolute bottom-8 right-0 z-10 pointer-events-none flex justify-end"
        style={{ paddingRight: 24 }}
      >
        <div
          role="button"
          tabIndex={0}
          className="pointer-events-auto rounded-2xl overflow-hidden cursor-pointer select-none"
          style={{
            background: 'rgba(10, 15, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 229, 255, 0.22)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            maxWidth: expanded ? 400 : 320,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            opacity: visible ? 1 : 0,
            transition:
              'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, max-width 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpanded((x) => !x)
            }
          }}
        >
          <div className="flex items-start justify-between px-5 pt-5 pb-4">
            <div>
              <p className="text-cyan-300/80 text-[10px] tracking-[0.2em] uppercase mb-1.5">
                {locale === 'es' ? 'Lote — en venta' : locale === 'zh' ? '地块 — 在售' : locale === 'fr' ? 'Lot — en vente' : 'Lot — for sale'}
              </p>
              <h3 className="text-white text-base font-medium leading-snug">
                {parcelSale.title}
              </h3>
              {parcelSale.areaHa != null && Number.isFinite(parcelSale.areaHa) ? (
                <p className="mt-2 text-white/45 text-[11px] font-mono leading-snug">
                  <span className="text-cyan-200/70">{parcelSale.areaHa.toFixed(2)} ha</span>
                  <span className="text-white/25"> — {areaLine}</span>
                </p>
              ) : null}
            </div>
            {closable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setCollapsed(true)
                }}
                className="ml-4 mt-0.5 text-white/30 hover:text-white/70 transition-colors"
                aria-label={locale === 'es' ? 'Minimizar' : locale === 'zh' ? '最小化' : locale === 'fr' ? 'Réduire' : 'Minimize'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="mx-5 border-t border-white/8" />

          <div
            className="px-5 py-4 text-white/55 leading-relaxed space-y-3"
            style={{ fontSize: expanded ? 14 : 13 }}
          >
            <p>{parcelCard.summary}</p>
            {expanded ? <p className="text-white/45 border-t border-white/8 pt-3">{parcelCard.detail}</p> : null}
          </div>

          <div className="px-5 pb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-white/25 text-[11px] font-mono">
              {Math.abs(parcelSale.latitude).toFixed(4)}°{parcelSale.latitude < 0 ? 'S' : 'N'}
            </span>
            <span className="text-white/15 text-[11px]">·</span>
            <span className="text-white/25 text-[11px] font-mono">
              {Math.abs(parcelSale.longitude).toFixed(4)}°{parcelSale.longitude < 0 ? 'W' : 'E'}
            </span>
            {expanded ? (
              <span className="text-white/20 text-[10px] w-full pt-1">
                {locale === 'es'
                  ? 'Toca de nuevo para contraer'
                  : locale === 'zh'
                    ? '再次点击收起'
                    : locale === 'fr'
                      ? 'Touchez à nouveau pour réduire'
                      : 'Tap again to collapse'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  if (!waypoint) return null

  const waypointCard = getWaypointCardText(waypoint, locale)

  if (collapsed && closable) {
    return (
      <CollapsedFab
        variant="waypoint"
        locale={locale}
        visible={visible}
        onExpand={() => setCollapsed(false)}
      />
    )
  }

  return (
    <div
      className="absolute bottom-8 right-0 z-10 pointer-events-none flex justify-end"
      style={{ paddingRight: 24 }}
    >
      <div
        role="button"
        tabIndex={0}
        className="pointer-events-auto rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{
          background: 'rgba(10, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          maxWidth: expanded ? 400 : 320,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          opacity: visible ? 1 : 0,
          transition:
            'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, max-width 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((x) => !x)
          }
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
          {closable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setCollapsed(true)
              }}
              className="ml-4 mt-0.5 text-white/30 hover:text-white/70 transition-colors"
              aria-label={locale === 'es' ? 'Minimizar' : locale === 'zh' ? '最小化' : locale === 'fr' ? 'Réduire' : 'Minimize'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/8" />

        {/* Summary + optional detail */}
        <div
          className="px-5 py-4 text-white/55 leading-relaxed space-y-3"
          style={{ fontSize: expanded ? 14 : 13 }}
        >
          <p>{waypointCard.summary}</p>
          {expanded ? <p className="text-white/45 border-t border-white/8 pt-3">{waypointCard.detail}</p> : null}
        </div>

        {/* Coordinates */}
        <div className="px-5 pb-5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-white/25 text-[11px] font-mono">
            {Math.abs(waypoint.latitude).toFixed(4)}°{waypoint.latitude < 0 ? 'S' : 'N'}
          </span>
          <span className="text-white/15 text-[11px]">·</span>
          <span className="text-white/25 text-[11px] font-mono">
            {Math.abs(waypoint.longitude).toFixed(4)}°{waypoint.longitude < 0 ? 'W' : 'E'}
          </span>
          {expanded ? (
            <span className="text-white/20 text-[10px] w-full pt-1">
              {locale === 'es'
                ? 'Toca de nuevo para contraer'
                : locale === 'zh'
                  ? '再次点击收起'
                  : locale === 'fr'
                    ? 'Touchez à nouveau pour réduire'
                    : 'Tap again to collapse'}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
})
export default InfoPanel
