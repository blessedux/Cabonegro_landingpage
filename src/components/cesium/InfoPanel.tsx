'use client'

import { memo, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Waypoint } from '@/lib/cesium/waypoints'
import { pickExploreCard } from '@/lib/cesium/exploreCardText'
import { getParcelExploreCard } from '@/lib/cesium/exploreParcelNarratives'
import { EXPLORE_UI_Z } from '@/lib/cesium/exploreUiLayers'
import InfoPanelContactChat from './InfoPanelContactChat'

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

const CTA_PARCEL: Record<string, string> = {
  en: 'Ask about this lot',
  es: 'Consultar sobre este lote',
  zh: '咨询此地块',
  fr: 'Renseignements sur ce lot',
}

const CTA_WAYPOINT: Record<string, string> = {
  en: 'Ask about this area',
  es: 'Consultar sobre esta zona',
  zh: '咨询此区域',
  fr: 'Renseignements sur cette zone',
}

function NarrativePanelLayer({ children }: { children: React.ReactNode }) {
  const [mount, setMount] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    setMount(document.body)
  }, [])
  if (!mount) return null
  return createPortal(
    <div
      className={`fixed inset-x-0 bottom-0 ${EXPLORE_UI_Z.narrative} pointer-events-none flex items-end justify-end`}
      style={{
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {children}
    </div>,
    mount,
  )
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
    <NarrativePanelLayer>
      <div className="pointer-events-auto flex items-center justify-end" style={shell}>
        <button
          type="button"
          aria-label={expandLabel}
          onClick={onExpand}
          className="touch-manipulation flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full select-none"
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
    </NarrativePanelLayer>
  )
}

const InfoPanel = memo(function InfoPanel({ waypoint, parcelSale, locale, closable = true }: InfoPanelProps) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

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
    setChatOpen(false)
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

    const parcelSubline = [
      parcelSale.areaHa != null && Number.isFinite(parcelSale.areaHa)
        ? `${parcelSale.areaHa.toFixed(2)} ha`
        : null,
      `${Math.abs(parcelSale.latitude).toFixed(3)}°${parcelSale.latitude < 0 ? 'S' : 'N'}, ${Math.abs(parcelSale.longitude).toFixed(3)}°${parcelSale.longitude < 0 ? 'W' : 'E'}`,
    ]
      .filter(Boolean)
      .join(' · ')

    return (
      <NarrativePanelLayer>
        <div
          role={chatOpen ? undefined : 'button'}
          tabIndex={chatOpen ? -1 : 0}
          className={`pointer-events-auto touch-manipulation rounded-2xl overflow-hidden select-none [-webkit-tap-highlight-color:transparent] ${chatOpen ? '' : 'cursor-pointer'}`}
          style={{
            background: 'rgba(10, 15, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 229, 255, 0.22)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            maxWidth: expanded || chatOpen ? 400 : 320,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            opacity: visible ? 1 : 0,
            transition:
              'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, max-width 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
          onClick={chatOpen ? undefined : () => setExpanded((e) => !e)}
          onKeyDown={chatOpen ? undefined : (e) => {
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
            {closable && !chatOpen ? (
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

          {chatOpen ? (
            <InfoPanelContactChat
              contextLabel={parcelSale.title}
              contextSubline={parcelSubline}
              tone="parcel"
              locale={locale}
              onClose={() => setChatOpen(false)}
            />
          ) : (
            <>
              <div
                className="px-5 py-4 text-white/55 leading-relaxed space-y-3"
                style={{ fontSize: expanded ? 14 : 13 }}
              >
                <p>{parcelCard.summary}</p>
                {expanded ? <p className="text-white/45 border-t border-white/8 pt-3">{parcelCard.detail}</p> : null}
              </div>

              {expanded ? (
                <div className="px-5 pb-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setChatOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] tracking-[0.14em] uppercase transition-colors"
                    style={{
                      color: 'rgba(0, 229, 255, 0.85)',
                      border: '1px solid rgba(0, 229, 255, 0.28)',
                      background: 'rgba(0, 229, 255, 0.06)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M7 8h10M7 12h6m-6 4h4m-6-12h14a2 2 0 012 2v12a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {CTA_PARCEL[locale] ?? CTA_PARCEL.en}
                  </button>
                </div>
              ) : null}

              <div className="px-5 pb-5 max-md:pb-6 max-md:pt-1 flex flex-wrap items-center max-md:items-end max-md:justify-end gap-x-4 gap-y-1 max-md:min-h-[48px]">
                <span className="text-white/25 text-[11px] font-mono max-md:shrink-0">
                  {Math.abs(parcelSale.latitude).toFixed(4)}°{parcelSale.latitude < 0 ? 'S' : 'N'}
                </span>
                <span className="text-white/15 text-[11px] max-md:shrink-0">·</span>
                <span className="text-white/25 text-[11px] font-mono max-md:shrink-0 max-md:inline-flex max-md:min-h-[44px] max-md:items-center max-md:pl-1 max-md:pr-1 max-md:-mr-1">
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
            </>
          )}
        </div>
      </NarrativePanelLayer>
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

  const waypointLabel = getLabel(waypoint, locale)
  const waypointSubline = `${Math.abs(waypoint.latitude).toFixed(3)}°${waypoint.latitude < 0 ? 'S' : 'N'}, ${Math.abs(waypoint.longitude).toFixed(3)}°${waypoint.longitude < 0 ? 'W' : 'E'}`

  return (
    <NarrativePanelLayer>
      <div
        role={chatOpen ? undefined : 'button'}
        tabIndex={chatOpen ? -1 : 0}
        className={`pointer-events-auto touch-manipulation rounded-2xl overflow-hidden select-none [-webkit-tap-highlight-color:transparent] ${chatOpen ? '' : 'cursor-pointer'}`}
        style={{
          background: 'rgba(10, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          maxWidth: expanded || chatOpen ? 400 : 320,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          opacity: visible ? 1 : 0,
          transition:
            'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, max-width 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={chatOpen ? undefined : () => setExpanded((e) => !e)}
        onKeyDown={chatOpen ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((x) => !x)
          }
        }}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-1.5">
              Cabo Negro
            </p>
            <h3 className="text-white text-base font-medium leading-snug">
              {waypointLabel}
            </h3>
          </div>
          {closable && !chatOpen ? (
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

        {chatOpen ? (
          <InfoPanelContactChat
            contextLabel={waypointLabel}
            contextSubline={waypointSubline}
            tone="waypoint"
            locale={locale}
            onClose={() => setChatOpen(false)}
          />
        ) : (
          <>
            <div
              className="px-5 py-4 text-white/55 leading-relaxed space-y-3"
              style={{ fontSize: expanded ? 14 : 13 }}
            >
              <p>{waypointCard.summary}</p>
              {expanded ? <p className="text-white/45 border-t border-white/8 pt-3">{waypointCard.detail}</p> : null}
            </div>

            {expanded && waypoint.id !== 'punta-arenas' ? (
              <div className="px-5 pb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setChatOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] tracking-[0.14em] uppercase transition-colors"
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M7 8h10M7 12h6m-6 4h4m-6-12h14a2 2 0 012 2v12a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {CTA_WAYPOINT[locale] ?? CTA_WAYPOINT.en}
                </button>
              </div>
            ) : null}

            <div className="px-5 pb-5 max-md:pb-6 max-md:pt-1 flex flex-wrap items-center max-md:items-end max-md:justify-end gap-x-4 gap-y-1 max-md:min-h-[48px]">
              <span className="text-white/25 text-[11px] font-mono max-md:shrink-0">
                {Math.abs(waypoint.latitude).toFixed(4)}°{waypoint.latitude < 0 ? 'S' : 'N'}
              </span>
              <span className="text-white/15 text-[11px] max-md:shrink-0">·</span>
              <span className="text-white/25 text-[11px] font-mono max-md:shrink-0 max-md:inline-flex max-md:min-h-[44px] max-md:items-center max-md:pl-1 max-md:pr-1 max-md:-mr-1">
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
          </>
        )}
      </div>
    </NarrativePanelLayer>
  )
})
export default InfoPanel
