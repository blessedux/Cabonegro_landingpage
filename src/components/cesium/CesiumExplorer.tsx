'use client'

import { useEffect, useRef, useCallback, useState, useMemo, type MutableRefObject } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import ExploreLoadingSurface from '@/components/ui/ExploreLoadingSurface'
import type { Waypoint } from '@/lib/cesium/waypoints'
import { WAYPOINTS } from '@/lib/cesium/waypoints'
import ExplorerControls from './ExplorerControls'
import ExplorerMobileDrawer from './ExplorerMobileDrawer'
import ExploreHud from './ExploreHud'
import { resolveExploreCaption } from '@/lib/cesium/exploreNarrative'
import CursorCrosshair from './CursorCrosshair'
import InfoPanel, { type ParcelSalePick } from './InfoPanel'
import VintageOverlay from './VintageOverlay'
import TimeDial from './TimeDial'
import { TargetingUI } from '@/components/ui/animated-hud-targeting-ui'
import {
  useCesiumViewerRuntime,
  type CesiumRuntimeSharedRefs,
} from './hooks/useCesiumViewerRuntime'
import { useWaypointFlights } from './hooks/useWaypointFlights'
import type { KmlLayerAlphas } from '@/lib/cesium/kmlLayers'

interface CesiumExplorerProps {
  locale?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

declare global {
  interface Window { Cesium?: CesiumModule; CESIUM_BASE_URL?: string }
}

const OVERVIEW_WAYPOINT = WAYPOINTS[0]

/** Waypoints where left-drag pans the camera (orbit auto-resumes after idle). */
const SITE_WAYPOINT_IDS = new Set(['terminal-maritimo', 'parque-logistico', 'parque-tecnologico'])

const WAYPOINT_HUD_HOLD_MS = 4000

const waypointHudOverlayVariants: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  fadeOut: { opacity: 0, scale: 0.96, transition: { duration: 1.35, ease: [0.33, 0, 0.2, 1] } },
}

export default function CesiumExplorer({ locale = 'en' }: CesiumExplorerProps) {
  const { push } = useNavigateWithPreloader()

  // ── Shared DOM ref ──────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(OVERVIEW_WAYPOINT ?? null)
  const [isFlying, setIsFlying] = useState(false)
  const [waypointTargetingKey, setWaypointTargetingKey] = useState(0)
  const [waypointTargetingVisible, setWaypointTargetingVisible] = useState(false)
  const [sceneCaption, setSceneCaption] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState(14)
  const [dayOffset, setDayOffset] = useState(0)
  const [nowTick, setNowTick] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false)
  const [menuOpacity, setMenuOpacity] = useState(1)
  const [selectedParcelSale, setSelectedParcelSale] = useState<ParcelSalePick | null>(null)

  // ── Shared motion refs (passed to both runtime and waypoint-flights hooks) ──
  const isFlyingRef = useRef(false)
  const cancelWaypointAnimRef = useRef<(() => void) | null>(null)
  const localOrbitRef = useRef<{
    active: boolean; target?: unknown
    offsetEnu?: { x: number; y: number; z: number }
    dir?: number; radPerSecAt1km?: number; radPerSecMin?: number
  }>({ active: false })
  const cameraFlightToSite1Ref = useRef(false)
  const site1OrbitActiveRef = useRef(false)
  const autoMotionEnabledRef = useRef(true)
  const flyToCaboSite1Ref = useRef<(() => void) | null>(null)
  const navigateWaypointsByScrollRef = useRef<(dir: 1 | -1) => void>(() => {})
  const pointerButtonsRef = useRef(0)
  const lastUserInputMsRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)
  const exploreMenuSelectionIdRef = useRef<string>(OVERVIEW_WAYPOINT?.id ?? 'overview')
  /** True only for the three site waypoints where drag-to-pan is desired. */
  const translateEnabledRef = useRef(false)

  // ── Caption ref (re-assigned each render so Cesium closures see fresh locale) ──
  const lastSceneCaptionRef = useRef<string | null>(null)
  const commitExploreCaptionRef = useRef<(raw: string | null) => void>(() => {})
  commitExploreCaptionRef.current = (raw: string | null) => {
    const next = resolveExploreCaption(locale, raw)
    if (next === lastSceneCaptionRef.current) return
    lastSceneCaptionRef.current = next
    setSceneCaption(next)
  }

  // Timers
  const menuFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waypointTargetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Bundle shared refs for the runtime hook ─────────────────────────────────
  // Stable object: property values are refs (never change identity).
  const sharedRefs = useRef<CesiumRuntimeSharedRefs>({
    isFlyingRef,
    cancelWaypointAnimRef,
    localOrbitRef,
    cameraFlightToSite1Ref,
    site1OrbitActiveRef,
    autoMotionEnabledRef,
    flyToCaboSite1Ref,
    navigateWaypointsByScrollRef,
    commitExploreCaptionRef,
    pointerButtonsRef,
    lastUserInputMsRef,
    exploreMenuSelectionIdRef,
    translateEnabledRef,
  }).current

  // ── Viewer runtime (init, KML pipeline, postUpdate) ─────────────────────────
  const runtime = useCesiumViewerRuntime({
    containerRef,
    shared: sharedRefs,
    setIsFlying,
    setSelectedParcelSale,
  })
  const {
    isLoaded, bootError, viewerNonce, imageryLabel,
    altitudeAsl, altitudeAgl, hud, globeRenderHint,
    viewerRef, orbitMathRef, kmlLayerAlphaRef,
    subdivisionParcelEntitiesRef, patagonValleyHaByKmlNameRef,
    selectedParcelEntityRef, setViewerTimeOfDay,
  } = runtime

  // ── Waypoint flights ────────────────────────────────────────────────────────
  const { flyToWaypoint, flyToCaboNegroSite1, navigateWaypointsByScroll } = useWaypointFlights({
    viewerRef,
    orbitMathRef,
    localOrbitRef,
    isFlyingRef,
    cameraFlightToSite1Ref,
    site1OrbitActiveRef,
    cancelWaypointAnimRef,
    kmlLayerAlphaRef: kmlLayerAlphaRef as MutableRefObject<KmlLayerAlphas>,
    lastUserInputMsRef,
    commitExploreCaptionRef,
    waypointTargetingTimerRef,
    setIsFlying,
    setActiveWaypoint,
    setWaypointTargetingKey,
    setWaypointTargetingVisible,
    setSelectedParcelSale,
    selectedParcelEntityRef,
    activeWaypointId: activeWaypoint?.id,
  })

  // Wire back the scroll callback into the ref the runtime uses
  navigateWaypointsByScrollRef.current = navigateWaypointsByScroll
  flyToCaboSite1Ref.current = flyToCaboNegroSite1

  // ── Effect: sync active waypoint to menu selection ───────────────────────────
  useEffect(() => {
    if (activeWaypoint) exploreMenuSelectionIdRef.current = activeWaypoint.id
  }, [activeWaypoint])

  // ── Effect: auto-motion enabled/disabled based on waypoint ──────────────────
  useEffect(() => {
    autoMotionEnabledRef.current = activeWaypoint !== null
  }, [activeWaypoint])

  // ── Effect: enable drag-to-translate only for the three site waypoints ───────
  useEffect(() => {
    translateEnabledRef.current = SITE_WAYPOINT_IDS.has(activeWaypoint?.id ?? '')
  }, [activeWaypoint?.id])

  // ── Effect: caption sync for jump-only waypoints ─────────────────────────────
  useEffect(() => {
    if (!isLoaded || !activeWaypoint) return
    if (activeWaypoint.id === 'overview') { commitExploreCaptionRef.current('narr:overview-2'); return }
    const jump: Record<string, string> = {
      'punta-arenas': 'narr:punta-arenas',
      'terminal-maritimo': 'narr:terminal-maritimo',
      'parque-logistico': 'narr:parque-logistico',
      'parque-tecnologico': 'narr:parque-tecnologico',
    }
    const k = jump[activeWaypoint.id]
    if (k) commitExploreCaptionRef.current(k)
  }, [isLoaded, locale, activeWaypoint?.id])

  // ── Effect: time-of-day → Cesium viewer ──────────────────────────────────────
  useEffect(() => {
    setViewerTimeOfDay(timeOfDay, dayOffset)
  }, [timeOfDay, dayOffset, isLoaded, viewerNonce, setViewerTimeOfDay])

  // ── Effect: 1 Hz clock tick ────────────────────────────────────────────────
  useEffect(() => {
    const id = window.setInterval(() => setNowTick(t => (t + 1) % 1_000_000), 1000)
    return () => window.clearInterval(id)
  }, [])

  // ── Effect: menu fade when flying ──────────────────────────────────────────
  useEffect(() => {
    if (!isFlying) {
      setMenuOpacity(1)
      if (menuFadeTimerRef.current) { clearTimeout(menuFadeTimerRef.current); menuFadeTimerRef.current = null }
    } else {
      setMenuOpacity(0)
    }
  }, [isFlying])

  // ── Effect: pointer button sync from OS (prevents stuck "buttons down") ──────
  useEffect(() => {
    const sync = (e: PointerEvent) => { pointerButtonsRef.current = e.buttons }
    const resetButtons = () => { pointerButtonsRef.current = 0 }
    const onVis = () => { if (document.visibilityState === 'visible') pointerButtonsRef.current = 0 }
    window.addEventListener('pointerdown', sync, true)
    window.addEventListener('pointermove', sync, true)
    window.addEventListener('pointerup', sync, true)
    window.addEventListener('pointercancel', sync, true)
    window.addEventListener('blur', resetButtons)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pointerdown', sync, true)
      window.removeEventListener('pointermove', sync, true)
      window.removeEventListener('pointerup', sync, true)
      window.removeEventListener('pointercancel', sync, true)
      window.removeEventListener('blur', resetButtons)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // ── Effect: reset pointer buttons on viewer reload ──────────────────────────
  useEffect(() => {
    if (!isLoaded) return
    pointerButtonsRef.current = 0
  }, [isLoaded, viewerNonce])

  // ── Effect: responsive breakpoint ──────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => { if (isDesktop) setMobileExploreOpen(false) }, [isDesktop])

  // ── Effect: cleanup timers ──────────────────────────────────────────────────
  useEffect(() => () => {
    if (menuFadeTimerRef.current) clearTimeout(menuFadeTimerRef.current)
    if (waypointTargetingTimerRef.current) clearTimeout(waypointTargetingTimerRef.current)
  }, [])

  // ── Callback: briefly reveal menu during camera flight (e.g. pointer move) ──
  const bumpMenuFromActivity = useCallback(() => {
    if (!isFlyingRef.current) return
    setMenuOpacity(1)
    if (menuFadeTimerRef.current) clearTimeout(menuFadeTimerRef.current)
    menuFadeTimerRef.current = setTimeout(() => {
      if (isFlyingRef.current) setMenuOpacity(0)
    }, 2200)
  }, [])

  // ── Memoised time display ───────────────────────────────────────────────────
  const selectedClock = useMemo(() => {
    const now = new Date()
    const sel = new Date(now)
    if (Number.isFinite(dayOffset) && dayOffset !== 0) sel.setUTCDate(sel.getUTCDate() + dayOffset)
    sel.setUTCHours((timeOfDay + 3) % 24, 0, 0, 0)
    const deltaHours = (sel.getTime() - now.getTime()) / (60 * 60 * 1000)
    return { now, sel, deltaHours }
  }, [dayOffset, timeOfDay, nowTick])

  // ── Stable handlers for top-bar controls ───────────────────────────────────
  const onTimeDialChange = useCallback((v: number | string) => setTimeOfDay(Number(v)), [])
  const onPrevDay = useCallback(() => setDayOffset(d => d - 1), [])
  const onNextDay = useCallback(() => setDayOffset(d => d + 1), [])

  // ── i18n labels ─────────────────────────────────────────────────────────────
  const backLabel: Record<string, string> = {
    en: '← Back to site', es: '← Volver al sitio', zh: '← 返回网站', fr: '← Retour au site',
  }
  const timeLabel: Record<string, string> = {
    en: 'Time', es: 'Hora', zh: '时间', fr: 'Heure',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100vh', background: isLoaded ? '#0a0f1a' : '#ffffff', cursor: isLoaded ? 'none' : undefined }}
      onPointerMove={(e) => {
        // Only update ref state — no setState call, so no re-renders here.
        pointerButtonsRef.current = e.buttons
        if (e.buttons !== 0) lastUserInputMsRef.current = performance.now()
        bumpMenuFromActivity()
      }}
      onPointerDown={(e) => {
        pointerButtonsRef.current = e.buttons
        lastUserInputMsRef.current = performance.now()
      }}
      onPointerUp={(e) => { pointerButtonsRef.current = e.buttons }}
    >
      {!isLoaded && (
        <ExploreLoadingSurface
          subtitle={bootError ?? 'Loading satellite terrain…'}
          suspended
        />
      )}

      {/* Cesium canvas mount point */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Vintage overlay — scanlines, vignette, grain, phosphor tint */}
      {isLoaded && <VintageOverlay />}

      {/* Globe load / stall status */}
      {isLoaded && globeRenderHint !== 'idle' && (
        <div
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-8"
          aria-live="polite"
          aria-busy
        >
          <p
            className="max-w-md text-center text-sm font-medium tracking-wide text-white md:text-base"
            style={{ textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.9)' }}
          >
            {globeRenderHint === 'stalled'
              ? 'Connecting back to satellite signal…'
              : 'Rendering satellite data…'}
          </p>
        </div>
      )}

      {/* Top bar */}
      {isLoaded && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(10,15,26,0.7) 0%, transparent 100%)' }}
        >
          <a
            href={`/${locale}`}
            className="pointer-events-auto flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200 md:justify-start md:text-xs md:tracking-wider"
            onClick={(e) => { e.preventDefault(); push(`/${locale}`) }}
          >
            <span className="sr-only md:hidden">{backLabel[locale] ?? backLabel.en}</span>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 md:hidden"
              aria-hidden
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="hidden md:inline">{backLabel[locale] ?? backLabel.en}</span>
          </a>

          <span className="hidden text-white/30 text-[11px] tracking-[0.3em] uppercase md:inline">
            Cabo Negro · Magallanes
          </span>

          <div className="pointer-events-auto flex items-center gap-5">
            <div className="flex items-center gap-3">
              <TimeDial
                label={timeLabel[locale] ?? timeLabel.en}
                min={6}
                max={22}
                step={1}
                value={timeOfDay}
                onChange={onTimeDialChange}
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="pointer-events-auto text-white/55 hover:text-white text-[10px] tracking-wider transition-colors duration-200"
                  onClick={onPrevDay}
                  aria-label="Previous day"
                >
                  −DAY
                </button>
                <span className="text-white/22 text-[10px] tracking-[0.22em]">/</span>
                <button
                  type="button"
                  className="pointer-events-auto text-white/55 hover:text-white text-[10px] tracking-wider transition-colors duration-200"
                  onClick={onNextDay}
                  aria-label="Next day"
                >
                  +DAY
                </button>
              </div>
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-white/30 text-[10px] tracking-[0.18em] uppercase">
                  Now {selectedClock.now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-white/50 text-[10px] font-mono">
                  Sel {selectedClock.sel.toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                  {' · '}
                  {selectedClock.deltaHours >= 0 ? '+' : '−'}{Math.abs(selectedClock.deltaHours).toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom region label */}
      {isLoaded && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-10 md:hidden"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(to top, rgba(10,15,26,0.92) 0%, rgba(10,15,26,0.5) 55%, transparent 100%)',
          }}
        >
          <p className="w-full px-4 pb-1 text-center text-white/35 text-[11px] tracking-[0.28em] uppercase whitespace-nowrap overflow-hidden text-ellipsis">
            Cabo Negro · Magallanes
          </p>
        </div>
      )}

      {/* Explorer UI chrome */}
      {isLoaded && (
        <>
          {!isDesktop ? (
            <button
              type="button"
              className="pointer-events-auto fixed left-4 z-[75] md:hidden flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-[rgba(10,15,26,0.9)] backdrop-blur-md shadow-lg"
              style={{ top: '4.25rem' }}
              aria-label={mobileExploreOpen ? 'Close explore menu' : 'Open explore menu'}
              aria-expanded={mobileExploreOpen}
              onClick={() => setMobileExploreOpen(o => !o)}
            >
              {mobileExploreOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ) : null}

          {!isDesktop && (
            <ExplorerMobileDrawer
              open={mobileExploreOpen}
              onOpenChange={setMobileExploreOpen}
              waypoints={WAYPOINTS}
              activeWaypoint={activeWaypoint}
              isFlying={isFlying}
              locale={locale}
              onSelectWaypoint={flyToWaypoint}
            />
          )}

          {isDesktop && (
            <ExploreHud
              cardinal={hud.cardinal}
              headingDeg={hud.headingDeg}
              imageryLabel={imageryLabel}
              subsatLonDeg={hud.subsatLonDeg}
              subsatLatDeg={hud.subsatLatDeg}
              altitudeAsl={altitudeAsl}
              altitudeAgl={altitudeAgl}
              sceneNarrative={sceneCaption ?? undefined}
            />
          )}

          {/* Crosshair — self-managing, zero parent re-renders on pointer move */}
          <CursorCrosshair enabled={isLoaded} />

          <AnimatePresence>
            {waypointTargetingVisible && (
              <motion.div
                key={waypointTargetingKey}
                className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
                variants={waypointHudOverlayVariants}
                initial="initial"
                animate="show"
                exit="fadeOut"
              >
                <TargetingUI
                  className="pointer-events-none h-auto w-[min(88vw,17.5rem)] drop-shadow-[0_0_28px_rgba(0,0,0,0.5)]"
                  pathColors={{ light: 'rgba(255,255,255,0.95)', dark: 'rgba(255,255,255,0.95)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {isDesktop && (
            <ExplorerControls
              waypoints={WAYPOINTS}
              activeWaypoint={activeWaypoint}
              isFlying={isFlying}
              locale={locale}
              onSelectWaypoint={flyToWaypoint}
              onNavigateWaypoints={navigateWaypointsByScroll}
              menuOpacity={menuOpacity}
            />
          )}

          <InfoPanel
            waypoint={selectedParcelSale ? null : activeWaypoint}
            parcelSale={selectedParcelSale}
            locale={locale}
            closable={isDesktop}
          />
        </>
      )}
    </div>
  )
}
