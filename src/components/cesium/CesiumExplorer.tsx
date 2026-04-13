'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { Viewer as CesiumViewer } from 'cesium'
import { useNavigateWithPreloader } from '@/hooks/useNavigateWithPreloader'
import ExploreLoadingSurface from '@/components/ui/ExploreLoadingSurface'
import type { Waypoint } from '@/lib/cesium/waypoints'
import {
  CESIUM_ION_TOKEN,
  TERRAIN_EXAGGERATION,
} from '@/lib/cesium/config'
import { WAYPOINTS } from '@/lib/cesium/waypoints'
import ExplorerControls from './ExplorerControls'
import InfoPanel from './InfoPanel'

interface CesiumExplorerProps {
  locale?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

declare global {
  interface Window {
    Cesium?: CesiumModule
    CESIUM_BASE_URL?: string
  }
}

const PUNTA_ARENAS_START = {
  longitude: -70.9171,
  latitude:  -53.1638,
  height:    14000,
} as const

const OVERVIEW_WAYPOINT = WAYPOINTS[0]

// Earth radius used for the flat-Earth ENU → lon/lat approximation.
// Accurate to <0.01% for ranges < 100 km, which is all we need.
const EARTH_R = 6371000.0

const DEG = 180 / Math.PI

/**
 * Given a waypoint, compute the orbital range so the camera altitude equals
 * waypoint.height:  range = height / |sin(pitch)|
 */
function waypointRange(wp: Pick<Waypoint, 'height' | 'pitch'>): number {
  const sp = Math.abs(Math.sin(wp.pitch))
  return sp > 0.05 ? wp.height / sp : wp.height
}

/**
 * Convert an ENU offset (east, north, up metres) relative to (focusLon, focusLat)
 * into a (lon, lat, height) tuple.  Uses the flat-Earth approximation which is
 * accurate to <0.01 % for ranges up to ~100 km — no Transforms or Matrix calls.
 */
function enuToLonLatH(
  focusLon: number, focusLat: number,
  east: number, north: number, up: number,
): [number, number, number] {
  const cosLat = Math.cos(focusLat / DEG)
  const lon = focusLon + (east  / (EARTH_R * cosLat)) * DEG
  const lat = focusLat + (north / EARTH_R) * DEG
  return [lon, lat, up]
}

/**
 * Compute camera (lon, lat, height) for an orbit camera at heading H, pitch P,
 * range R around a focus point.  Returns values ready for Cartesian3.fromDegrees.
 */
function orbitCameraLLH(
  focusLon: number, focusLat: number,
  heading: number, pitch: number, range: number,
): [number, number, number] {
  const cosP = Math.cos(pitch), sinP = Math.sin(pitch)
  const sinH = Math.sin(heading), cosH = Math.cos(heading)
  // ENU offset: camera is above and to the side of the focus.
  // pitch < 0 ⟹ sinP < 0 ⟹ up = −range·sinP > 0 ✓
  return enuToLonLatH(
    focusLon, focusLat,
    range * cosP * sinH,   // east
    range * cosP * cosH,   // north
    -range * sinP,         // up (positive)
  )
}

/** Format metres for the altitude HUD. */
function formatAlt(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(1)} km`
  if (m >= 1000)  return `${(m / 1000).toFixed(2)} km`
  return `${m} m`
}

// ─────────────────────────────────────────────────────────────────────────────
// Boat animation + site markers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function addBoatAnimation(viewer: CesiumViewer, Cesium: CesiumModule) {
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const stopTime  = Cesium.JulianDate.addSeconds(startTime, 300, new Cesium.JulianDate())

  const position = new Cesium.SampledPositionProperty()
  const routePoints = [
    { lon: -70.32, lat: -52.84, t: 0   },
    { lon: -70.28, lat: -52.83, t: 60  },
    { lon: -70.24, lat: -52.84, t: 120 },
    { lon: -70.20, lat: -52.85, t: 180 },
    { lon: -70.16, lat: -52.85, t: 240 },
    { lon: -70.12, lat: -52.84, t: 300 },
  ]
  for (const pt of routePoints) {
    const time = Cesium.JulianDate.addSeconds(startTime, pt.t, new Cesium.JulianDate())
    position.addSample(time, Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, 5))
  }
  position.setInterpolationOptions({
    interpolationDegree: 3,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  })

  viewer.entities.add({
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({ start: startTime, stop: stopTime }),
    ]),
    position,
    orientation: new Cesium.VelocityOrientationProperty(position),
    point: {
      pixelSize: 10,
      color: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#4fc3f7'),
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
    label: {
      text: '⛴',
      font: '18px sans-serif',
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, -28),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })

  viewer.clock.startTime    = startTime
  viewer.clock.stopTime     = stopTime
  viewer.clock.clockRange   = Cesium.ClockRange.LOOP_STOP
  viewer.clock.multiplier   = 1
  viewer.clock.shouldAnimate = true
}

function addSiteMarkers(viewer: CesiumViewer, Cesium: CesiumModule) {
  const t0 = Date.now()
  const sites = [
    { lon: -70.851937, lat: -52.927339, label: 'Cabo Negro — Site 1', color: '#00d4ff' },
    { lon: -70.858379, lat: -52.927713, label: 'Site 2',              color: '#4dffb0' },
    { lon: -70.9171,   lat: -53.1638,   label: 'Punta Arenas',        color: '#ff9f43' },
  ]

  for (const site of sites) {
    const base = Cesium.Color.fromCssColorString(site.color)

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(site.lon, site.lat, 20),
      point: {
        pixelSize: new Cesium.CallbackProperty(() => 18 + Math.sin((Date.now() - t0) / 1000 * 2.2) * 6, false),
        color:     new Cesium.CallbackProperty(() => base.withAlpha(0.25 + Math.sin((Date.now() - t0) / 1000 * 2.2) * 0.20), false),
        outlineColor: Cesium.Color.TRANSPARENT,
        outlineWidth: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(500, 1.8, 150000, 0.4),
      },
    })

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(site.lon, site.lat, 20),
      point: {
        pixelSize: 8,
        color: base,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1.5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(500, 1.5, 150000, 0.5),
      },
      label: {
        text: site.label,
        font: '600 12px "Inter", system-ui, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: new Cesium.Color(0, 0, 0, 0.85),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(14, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(500, 1.2, 80000, 0.5),
        translucencyByDistance: new Cesium.NearFarScalar(2000, 1.0, 90000, 0.0),
      },
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CesiumExplorer({ locale = 'en' }: CesiumExplorerProps) {
  const { push } = useNavigateWithPreloader()

  const containerRef      = useRef<HTMLDivElement>(null)
  const viewerRef         = useRef<CesiumViewer | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const groundHeightRef   = useRef<number>(0)

  const [activeWaypoint,        setActiveWaypoint]        = useState<Waypoint | null>(OVERVIEW_WAYPOINT ?? null)
  const [isLoaded,              setIsLoaded]              = useState(false)
  const [isFlying,              setIsFlying]              = useState(false)
  const [timeOfDay,             setTimeOfDay]             = useState(14)
  const [altitudeAsl,           setAltitudeAsl]           = useState<number | null>(null)
  const [altitudeAgl,           setAltitudeAgl]           = useState<number | null>(null)
  // Incremented every time the viewer is (re)created; forces the tick useEffect
  // to restart even when isLoaded doesn't change (React Strict Mode double-init).
  const [viewerNonce, setViewerNonce] = useState(0)

  // ── Waypoint transition ─────────────────────────────────────────────────────
  const flyToWaypoint = useCallback((waypoint: Waypoint) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed()) return
    const Cesium = window.Cesium
    if (!Cesium) return

    setIsFlying(true)
    setActiveWaypoint(waypoint)

    const range = waypointRange(waypoint)
    const [camLon, camLat, camH] = orbitCameraLLH(
      waypoint.longitude, waypoint.latitude,
      waypoint.heading, waypoint.pitch, range,
    )

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(camLon, camLat, camH),
      orientation: { heading: waypoint.heading + Math.PI, pitch: waypoint.pitch, roll: 0 },
      duration: 3.5,
      complete: () => { setIsFlying(false) },
      cancel: () => { setIsFlying(false) },
    })
  }, [])

  // ── Time-of-day sync ────────────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium) return
    const Cesium = window.Cesium
    const date = new Date()
    date.setUTCHours((timeOfDay + 3) % 24, 0, 0, 0)
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
  }, [timeOfDay])

  // ── Ground-height sampling for AGL ─────────────────────────────────────────
  useEffect(() => {
    if (!activeWaypoint || !isLoaded) return
    const viewer = viewerRef.current
    const Cesium = window.Cesium
    if (!viewer || viewer.isDestroyed() || !Cesium) return

    const positions = [Cesium.Cartographic.fromDegrees(activeWaypoint.longitude, activeWaypoint.latitude)]
    Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions)
      .then((sampled: unknown[]) => {
        groundHeightRef.current = (sampled[0] as { height?: number })?.height ?? 0
      })
      .catch(() => { groundHeightRef.current = 0 })
  }, [activeWaypoint, isLoaded])

  // ── Altitude HUD (camera: Cesium ScreenSpaceCameraController) ──────────────
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium) return

    let altCounter = 0

    const tick = () => {
      const v = viewerRef.current
      if (!v || v.isDestroyed()) return

      try {
        if (++altCounter >= 10) {
          altCounter = 0
          const carto = v.camera.positionCartographic
          if (carto) {
            const asl = Math.round(carto.height)
            setAltitudeAsl(asl)
            setAltitudeAgl(Math.max(0, asl - Math.round(groundHeightRef.current)))
          }
        }
      } catch (err) {
        console.error('[CesiumExplorer] tick error:', err)
      }

      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [viewerNonce])

  // ── Cesium init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let viewer: CesiumViewer | null = null

    const initCesium = async () => {
      const Cesium = await import('cesium')

      window.CESIUM_BASE_URL = `${window.location.origin}/_next/static/cesium/`
      Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

      if (!containerRef.current) return

      const isMobile = window.innerWidth < 768

      // Primary: Cesium Ion Bing Maps aerial (asset 2). Fallback: ArcGIS, then Natural Earth.
      let baseLayer: InstanceType<typeof Cesium.ImageryLayer>
      try {
        const bingProvider = await Cesium.IonImageryProvider.fromAssetId(2)
        baseLayer = new Cesium.ImageryLayer(bingProvider)
        console.info('[CesiumExplorer] Imagery: OK — Cesium Ion Bing (asset 2)')
      } catch (err) {
        console.warn('[CesiumExplorer] Ion Bing imagery unavailable, trying ArcGIS.', err)
        try {
          const arcGisProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          )
          baseLayer = new Cesium.ImageryLayer(arcGisProvider)
          console.info('[CesiumExplorer] Imagery: OK — ArcGIS World Imagery (fallback)')
        } catch {
          const tmsProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'), { fileExtension: 'jpg' },
          )
          baseLayer = new Cesium.ImageryLayer(tmsProvider)
          console.info('[CesiumExplorer] Imagery: OK — Natural Earth II (bundled fallback)')
        }
      }

      let terrainProvider: InstanceType<typeof Cesium.TerrainProvider>
      try {
        terrainProvider = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: true,
        })
      } catch (err) {
        console.warn('[CesiumExplorer] World terrain unavailable.', err)
        terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }

      viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider,
        baseLayer: false,
        baseLayerPicker:       false,
        geocoder:              false,
        homeButton:            false,
        sceneModePicker:       false,
        navigationHelpButton:  false,
        animation:             false,
        timeline:              false,
        fullscreenButton:      false,
        infoBox:               false,
        selectionIndicator:    false,
        creditContainer:       document.createElement('div'),
        msaaSamples:           isMobile ? 1 : 4,
      })

      viewer.imageryLayers.add(baseLayer)

      try {
        viewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync())
      } catch { /* optional */ }

      viewerRef.current = viewer
      window.Cesium     = Cesium

      // Standard mouse / touch navigation (orbit, pan, zoom).
      const ctrl = viewer.scene.screenSpaceCameraController
      ctrl.enableTranslate = true
      ctrl.enableRotate    = true
      ctrl.enableTilt      = true
      ctrl.enableLook      = true
      ctrl.enableZoom      = true
      ctrl.minimumZoomDistance = 50
      ctrl.maximumZoomDistance = 50_000_000

      viewer.scene.verticalExaggeration = isMobile ? 1.5 : TERRAIN_EXAGGERATION

      // Lighting — Patagonia summer afternoon
      viewer.scene.globe.enableLighting            = true
      viewer.scene.globe.dynamicAtmosphereLighting = false
      viewer.scene.globe.atmosphereLightIntensity  = 12.0
      viewer.scene.globe.atmosphereRayleighCoefficient = new Cesium.Cartesian3(5.5e-6, 13.0e-6, 28.4e-6)

      const initDate = new Date()
      initDate.setUTCHours(17, 0, 0, 0)
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(initDate)

      viewer.scene.atmosphere.brightnessShift = 0.45
      viewer.scene.atmosphere.saturationShift = 0.15
      viewer.scene.fog.enabled                = true
      viewer.scene.fog.density                = isMobile ? 0.0003 : 0.00015
      viewer.scene.fog.minimumBrightness      = 0.35
      viewer.scene.globe.depthTestAgainstTerrain = true

      viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.04, 0.1, 1.0)

      const skyBox = viewer.scene.skyBox as { show?: boolean } | undefined
      if (skyBox) skyBox.show = true
      const skyAtmosphere = viewer.scene.skyAtmosphere as { show?: boolean } | undefined
      if (skyAtmosphere) skyAtmosphere.show = true

      viewer.shadows        = !isMobile
      viewer.terrainShadows = isMobile ? Cesium.ShadowMode.DISABLED : Cesium.ShadowMode.ENABLED

      viewer.scene.postProcessStages.fxaa.enabled = true
      if (!isMobile) {
        viewer.scene.postProcessStages.bloom.enabled             = true
        viewer.scene.postProcessStages.bloom.uniforms.contrast   = 80
        viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.1
        viewer.scene.postProcessStages.bloom.uniforms.glowOnly   = false
      }

      viewer.resolutionScale = isMobile ? 0.75 : 1.0
      viewer.scene.globe.maximumScreenSpaceError = isMobile ? 4 : 2
      if (!isMobile) viewer.scene.globe.tileCacheSize = 200

      addBoatAnimation(viewer, Cesium)
      addSiteMarkers(viewer, Cesium)

      // ── Initial camera position ──────────────────────────────────────────────
      if (OVERVIEW_WAYPOINT) {
        const wp = OVERVIEW_WAYPOINT
        const range = waypointRange(wp)
        const [lon, lat, h] = orbitCameraLLH(wp.longitude, wp.latitude, wp.heading, wp.pitch, range)
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, h),
          orientation: { heading: wp.heading + Math.PI, pitch: wp.pitch, roll: 0 },
        })
      } else {
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            PUNTA_ARENAS_START.longitude, PUNTA_ARENAS_START.latitude, PUNTA_ARENAS_START.height,
          ),
          orientation: { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 },
        })
      }

      setIsLoaded(true)
      // Always increment so the tick useEffect restarts even in Strict Mode
      // (where the second setIsLoaded(true) would otherwise be a no-op).
      setViewerNonce(n => n + 1)
    }

    const safetyTimer = setTimeout(() => setIsLoaded(true), 8000)
    initCesium().catch((err) => {
      console.error('[CesiumExplorer] Init failed:', err)
      setIsLoaded(true)
    })

    return () => {
      clearTimeout(safetyTimer)
      if (viewer && !viewer.isDestroyed()) viewer.destroy()
      viewerRef.current        = null
      delete window.Cesium
    }
  }, [])

  // ── i18n ────────────────────────────────────────────────────────────────────
  const backLabel: Record<string, string> = {
    en: '← Back to site', es: '← Volver al sitio', zh: '← 返回网站', fr: '← Retour au site',
  }
  const timeLabel: Record<string, string> = {
    en: 'Time', es: 'Hora', zh: '时间', fr: 'Heure',
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, background: isLoaded ? '#0a0f1a' : '#ffffff' }}>
      {!isLoaded && <ExploreLoadingSurface subtitle="Loading satellite terrain…" />}

      {/* Cesium canvas */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Top bar */}
      {isLoaded && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(10,15,26,0.7) 0%, transparent 100%)' }}
        >
          <a
            href={`/${locale}`}
            className="pointer-events-auto text-white/60 hover:text-white text-xs tracking-wider transition-colors duration-200"
            onClick={(e) => { e.preventDefault(); push(`/${locale}`) }}
          >
            {backLabel[locale] ?? backLabel.en}
          </a>

          <span className="text-white/30 text-[11px] tracking-[0.3em] uppercase">
            Cabo Negro · Magallanes
          </span>

          <div className="pointer-events-auto flex items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="text-white/35 text-[10px] tracking-wider">
                {timeLabel[locale] ?? timeLabel.en}
              </span>
              <input
                type="range" min={6} max={22} step={1} value={timeOfDay}
                onChange={(e) => setTimeOfDay(Number(e.target.value))}
                className="w-24 cursor-pointer"
                style={{ accentColor: 'rgba(255,255,255,0.8)' }}
              />
              <span className="text-white/35 text-[10px] font-mono w-10">
                {String(timeOfDay).padStart(2, '0')}:00
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoaded && (
        <>
          <ExplorerControls
            waypoints={WAYPOINTS}
            activeWaypoint={activeWaypoint}
            isFlying={isFlying}
            locale={locale}
            onSelectWaypoint={flyToWaypoint}
          />
          <InfoPanel
            waypoint={activeWaypoint}
            locale={locale}
            onClose={() => setActiveWaypoint(null)}
          />
        </>
      )}

      {/* ── Altitude HUD ──────────────────────────────────────────────────────── */}
      {isLoaded && altitudeAsl !== null && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ bottom: '1.5rem', left: '1.5rem' }}
        >
          <div style={{
            background: 'rgba(10,15,26,0.72)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            padding: '10px 14px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            minWidth: '88px',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '5px', fontFamily: 'system-ui' }}>
              Altitude
            </div>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: '15px', fontWeight: 600, letterSpacing: '0.04em', fontFamily: '"JetBrains Mono","Fira Code",ui-monospace,monospace', lineHeight: 1.1 }}>
              {formatAlt(altitudeAsl)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: '3px', fontFamily: 'system-ui' }}>
              ASL
            </div>

            {altitudeAgl !== null && altitudeAsl < 5000 && (
              <div style={{ marginTop: '9px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'system-ui' }}>
                  AGL
                </div>
                <div style={{ color: 'rgba(79,195,247,0.88)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', fontFamily: '"JetBrains Mono","Fira Code",ui-monospace,monospace', lineHeight: 1.1 }}>
                  {formatAlt(altitudeAgl)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
