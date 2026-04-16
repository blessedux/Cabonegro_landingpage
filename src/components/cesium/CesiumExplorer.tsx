'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
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
import ExploreHud from './ExploreHud'
import { resolveExploreCaption } from '@/lib/cesium/exploreNarrative'
import CursorCrosshair from './CursorCrosshair'
import InfoPanel, { type ParcelSalePick } from './InfoPanel'
import VintageOverlay from './VintageOverlay'
import { TargetingUI } from '@/components/ui/animated-hud-targeting-ui'
import {
  applyKmlLayerTargetForWaypoint,
  createInitialKmlLayerAlphas,
  stepKmlLayerAlphas,
  type KmlLayerAlphas,
} from '@/lib/cesium/kmlLayers'
import { applySociedadesKmlStyling } from '@/lib/cesium/kmlSociedadesWalls'

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

/** Drift is a westward translation; keep legacy constant name unused. */
const ALWAYS_ORBIT_YAW_RADIANS_PER_FRAME = 0.000017
/** Overview (Vista General): faster auto-orbit, westward. */
const OVERVIEW_ORBIT_YAW_MULT = 2.9
/** After left-click fly to Cabo Negro site — visible westward orbit at ~16.5 km. */
const SITE1_ORBIT_YAW_MULT = 1.85
/** −1 = rotate so the view advances toward western longitudes (satellite-west feel). */
const AUTO_ORBIT_WEST_SIGN = -1
/** Above this ellipsoid height (m), orbit yaw ramps up so motion stays noticeable. */
const ORBIT_YAW_ALT_SCALE_REF_M = 2800
const ORBIT_YAW_ALT_GAIN_MIN = 1
const ORBIT_YAW_ALT_GAIN_MAX = 14
/** Camera flight duration for overview → Cabo Negro site pose (s). */
const FLY_TO_SITE1_DURATION_SEC = 4.8
/** Min interval between terrain samples for AGL under the camera (ms). */
const TERRAIN_UNDER_CAMERA_MS = 400

/** Served from `public/cesium/` (copy of `src/lib/cesium/SUBDIVISIÓN VIGENTE.kmz`). */
const SUBDIVISION_KMZ_URL = '/cesium/subdivision-vigente.kmz'
const SOCIEDADES_CN_KMZ_URL = '/cesium/sociedades-cn.kmz'
const SOCIEDADES_CN1_KMZ_URL = '/cesium/sociedades-cn-1.kmz'
/** Extruded wall height for Sociedades polylines (metres above sampled terrain). */
const SOCIEDADES_WALL_HEIGHT_M = 20
/** Cap waypoint-scene `setView` rate to limit tile/GPU churn (“jumping frames” is OK). */
const WAYPOINT_SETVIEW_MIN_INTERVAL_MS = 1000 / 6

/**
 * Same basis as dev `altitudeM_asl`: integer metres above WGS84 ellipsoid (not km rounded),
 * so the HUD matches `[CesiumExplorer] camera pose` logs.
 */
function formatAlt(m: number): string {
  const r = Math.round(m)
  if (r >= 100_000) return `${(r / 1000).toFixed(0)} km`
  return `${r.toLocaleString('en-US')} m`
}

type FlyPose = {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
}

/** Longer hops get longer flyTo; clamp keeps menu navigation snappy. */
function estimateFlyDurationSec(
  viewer: CesiumViewer,
  Cesium: CesiumModule,
  pose: Pick<FlyPose, 'longitude' | 'latitude' | 'height'>,
): number {
  const from = viewer.camera.position
  const to = Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height)
  const d = Cesium.Cartesian3.distance(from, to)
  return Math.min(14, Math.max(3.4, d / 420_000))
}

/**
 * Travel = plain left/middle drag (pan). Heading change = Ctrl/Cmd + left drag. Pitch = right drag.
 * (Cesium splits “angle” into rotate vs tilt; modifier applies to orbit/heading.)
 */
function applyExplorerCameraInteractionScheme(Cesium: CesiumModule, viewer: CesiumViewer) {
  const CameraEventType = Cesium.CameraEventType
  const ctrl = viewer.scene.screenSpaceCameraController

  // Use Cesium translate only for middle-drag; left-drag travel is implemented manually (see canvas listeners).
  ctrl.translateEventTypes = [CameraEventType.MIDDLE_DRAG] as typeof ctrl.translateEventTypes
  // Travel only: plain drag pans the map.
  ctrl.rotateEventTypes = [] as unknown as typeof ctrl.rotateEventTypes
  // Keep rotate enabled so Cesium doesn't drop left-drag handling; no rotate bindings means no rotation.
  ctrl.enableRotate = true
  ctrl.tiltEventTypes = [CameraEventType.RIGHT_DRAG] as typeof ctrl.tiltEventTypes
  // Disable wheel-zoom: wheel is reserved for waypoint navigation.
  // Touch pinch still zooms via Cesium PINCH. Trackpad pinch is handled by ctrl/meta+wheel in our wheel listener.
  ctrl.zoomEventTypes = [CameraEventType.PINCH]
  ctrl.enableTranslate = true
  ctrl.enableTilt = true
  ctrl.enableLook = false
  ctrl.enableZoom = true
  ctrl.minimumZoomDistance = 50
  ctrl.maximumZoomDistance = 50_000_000
}

function sceneDurationSec(keyframes: CameraKeyframe[]): number {
  if (keyframes.length === 0) return 0
  return Math.max(...keyframes.map(k => k.t))
}

type CameraKeyframe = {
  t: number
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
  caption?: string
}

function cardinal8(headingRad: number): string {
  const d = ((headingRad * 180 / Math.PI) % 360 + 360) % 360
  const rose = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return rose[Math.round(d / 45) % 8]
}

/** Staged click-zoom targets. */
const ZOOM_STAGE_1_TARGET_ASL_M = 100_000
const ZOOM_STAGE_2_TARGET_ASL_M = 3_000
const ZOOM_STAGE_DECIDE_ABOVE_ASL_M = 140_000
/** If already near stage 1, jump to stage 2. */
const ZOOM_STAGE_2_TRIGGER_BELOW_ASL_M = 140_000
const CLICK_ZOOM_ASL_MIN_M = 50
const CLICK_ZOOM_ASL_MAX_M = 50_000_000

/** Pause drift briefly after user input (ms). */
const DRIFT_IDLE_AFTER_INPUT_MS = 900

/** Westward drift speed model (m/s). */
const DRIFT_REF_ASL_M = 500_000
const DRIFT_MPS_AT_REF = 1400
const DRIFT_MPS_MIN = 1.2
const DRIFT_MPS_MAX = 2400

// Punta Arenas special: jump to a curated pose, then orbit around the viewport center target.
const PUNTA_ARENAS_START_POSE = {
  longitude: -70.921316,
  latitude: -53.214332,
  height: 1252,
  heading: 6.103893,
  pitch: -0.232141,
  roll: 0,
} as const

const LOGISTICS_PARK_START_POSE = {
  longitude: -70.889969,
  latitude: -52.931733,
  height: 832,
  heading: 1.529472,
  pitch: -0.413041,
  roll: 0,
} as const

/** Logged camera pose — Maritime Terminal waypoint. */
const MARITIME_TERMINAL_START_POSE = {
  longitude: -70.842343,
  latitude: -52.916083,
  height: 794,
  heading: 2.255994,
  pitch: -0.448934,
  roll: 0,
} as const

/** Logged camera pose — Technology Park waypoint. */
const TECHNOLOGY_PARK_START_POSE = {
  longitude: -70.860034,
  latitude: -52.948507,
  height: 1037,
  heading: 0.466191,
  pitch: -0.468321,
  roll: 0,
} as const

const LOCAL_ORBIT_RAD_PER_SEC_AT_1KM = 0.035
const LOCAL_ORBIT_RAD_PER_SEC_MIN = 0.006

/** Vista General — local lookAt orbit speed after each staged fly (rad/s model). */
const OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM = 0.038
const OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN = 0.007

// 20% slower vs previous.
const PUNTA_ORBIT_RAD_PER_SEC_AT_1KM = 0.048
const PUNTA_ORBIT_RAD_PER_SEC_MIN = 0.01

function shouldDebugCesium(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const qs = new URLSearchParams(window.location.search)
    return qs.has('debugCesium') || qs.has('debug')
  } catch {
    return false
  }
}

function dbg(...args: unknown[]): void {
  if (!shouldDebugCesium()) return
  // Keep logs searchable + lightweight.
  // eslint-disable-next-line no-console
  console.log('[CesiumExplorer]', ...args)
}

function shouldLogCameraPose(): boolean {
  try {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV !== 'production') return true
    const qs = new URLSearchParams(window.location.search)
    return qs.has('logCamera') || qs.has('logPose') || shouldDebugCesium()
  } catch {
    return false
  }
}

function warnOnceFactory() {
  const seen = new Set<string>()
  return (key: string, ...args: unknown[]) => {
    if (seen.has(key)) return
    seen.add(key)
    // eslint-disable-next-line no-console
    console.warn('[CesiumExplorer]', ...args)
  }
}

const warnOnce = warnOnceFactory()

/**
 * Move the camera along the view direction so ellipsoidal altitude (ASL) changes by
 * `stepM` — “in” lowers altitude, “out” raises it (clamped).
 */
function zoomAlongViewForAltitudeStep(
  viewer: CesiumViewer,
  Cesium: CesiumModule,
  direction: 'in' | 'out',
  stepM: number,
): void {
  const scene = viewer.scene
  const cam = viewer.camera
  const ellipsoid = scene.globe.ellipsoid
  const eye = cam.position
  const dir = cam.direction

  const cartoScratch = new Cesium.Cartographic()
  const tempMove = new Cesium.Cartesian3()
  const tempPos = new Cesium.Cartesian3()
  const normalScratch = new Cesium.Cartesian3()

  Cesium.Cartographic.fromCartesian(eye, ellipsoid, cartoScratch)
  const h0 = cartoScratch.height
  const deltaH = direction === 'in' ? -stepM : stepM
  const hTarget = Cesium.Math.clamp(h0 + deltaH, CLICK_ZOOM_ASL_MIN_M, CLICK_ZOOM_ASL_MAX_M)
  if (Math.abs(hTarget - h0) < 0.01) return

  const heightAtS = (s: number): number => {
    Cesium.Cartesian3.multiplyByScalar(dir, s, tempMove)
    Cesium.Cartesian3.add(eye, tempMove, tempPos)
    Cesium.Cartographic.fromCartesian(tempPos, ellipsoid, cartoScratch)
    return cartoScratch.height
  }

  const g = (s: number): number => heightAtS(s) - hTarget

  /** d(ellipsoid height)/ds along view ray ≈ dir · surface normal at sample point. */
  const newtonStep = (s: number): number => {
    Cesium.Cartesian3.multiplyByScalar(dir, s, tempMove)
    Cesium.Cartesian3.add(eye, tempMove, tempPos)
    ellipsoid.geodeticSurfaceNormal(tempPos, normalScratch)
    Cesium.Cartesian3.normalize(normalScratch, normalScratch)
    const dhdS = Cesium.Cartesian3.dot(dir, normalScratch)
    return dhdS
  }

  let s = 0
  for (let i = 0; i < 28; i++) {
    const err = hTarget - heightAtS(s)
    if (Math.abs(err) < 0.2) break
    const dhdS = newtonStep(s)
    if (Math.abs(dhdS) < 1e-5) break
    const step = Cesium.Math.clamp(err / dhdS, -4_000_000, 4_000_000)
    s += step
  }

  if (Math.abs(heightAtS(s) - hTarget) > 1) {
    let lo = -12_000_000
    let hi = 12_000_000
    let glo = g(lo)
    let ghi = g(hi)
    let expand = 0
    while (glo * ghi > 0 && expand < 18) {
      lo *= 1.35
      hi *= 1.35
      glo = g(lo)
      ghi = g(hi)
      expand++
    }
    if (glo * ghi <= 0) {
      for (let i = 0; i < 52; i++) {
        const mid = (lo + hi) * 0.5
        const gm = g(mid)
        if (Math.abs(gm) < 0.25) {
          s = mid
          break
        }
        if (glo * gm <= 0) {
          hi = mid
          ghi = gm
        } else {
          lo = mid
          glo = gm
        }
        s = (lo + hi) * 0.5
      }
    }
  }

  Cesium.Cartesian3.multiplyByScalar(dir, s, tempMove)
  Cesium.Cartesian3.add(eye, tempMove, tempPos)
  cam.position = tempPos
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

function smoothstep01(x: number): number {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

function computeWestDriftMps(aslM: number): number {
  // Far away: drift is noticeable; close: drift is very slow.
  // Use a smooth curve against altitude.
  // At 3km -> near min; at 500km -> around ref; clamp above.
  const u = smoothstep01(aslM / DRIFT_REF_ASL_M)
  const mps = DRIFT_MPS_MIN + (DRIFT_MPS_AT_REF - DRIFT_MPS_MIN) * u
  return Math.max(DRIFT_MPS_MIN, Math.min(DRIFT_MPS_MAX, mps))
}

function isClickLikeGesture(down: { x: number; y: number; t: number } | null, upX: number, upY: number): boolean {
  if (!down) return false
  const dx = upX - down.x
  const dy = upY - down.y
  const dist2 = dx * dx + dy * dy
  const dt = performance.now() - down.t
  return dist2 <= (6 * 6) && dt <= 350
}

function centroidLonLatFromEntity(
  C: CesiumModule,
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
): { lon: number; lat: number } | null {
  const t = viewer.clock.currentTime
  if (entity.polygon?.hierarchy) {
    const hierarchy = entity.polygon.hierarchy.getValue(t)
    const positions = hierarchy?.positions
    if (!positions?.length) return null
    let sumLon = 0
    let sumLat = 0
    for (let i = 0; i < positions.length; i++) {
      const carto = C.Cartographic.fromCartesian(positions[i])
      sumLon += C.Math.toDegrees(carto.longitude)
      sumLat += C.Math.toDegrees(carto.latitude)
    }
    const n = positions.length
    return { lon: sumLon / n, lat: sumLat / n }
  }
  if (entity.polyline?.positions) {
    const positions = entity.polyline.positions.getValue(t)
    if (!positions?.length) return null
    let sumLon = 0
    let sumLat = 0
    for (let i = 0; i < positions.length; i++) {
      const carto = C.Cartographic.fromCartesian(positions[i])
      sumLon += C.Math.toDegrees(carto.longitude)
      sumLat += C.Math.toDegrees(carto.latitude)
    }
    const n = positions.length
    return { lon: sumLon / n, lat: sumLat / n }
  }
  return null
}

function entityDisplayName(
  C: CesiumModule,
  viewer: CesiumViewer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entity: any,
): string {
  const t = viewer.clock.currentTime
  if (typeof entity.name === 'string' && entity.name.trim()) return entity.name
  if (entity.name?.getValue) {
    const v = entity.name.getValue(t)
    if (typeof v === 'string' && v.trim()) return v
  }
  return 'Lot'
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

/** Hold through `TargetingUI` draw, then slow fade (AnimatePresence `exit` variant). */
const WAYPOINT_HUD_HOLD_MS = 4000

/** Gap between Cesium `postUpdate` heartbeats — above this, show “Rendering satellite data…”. */
const SCENE_BUSY_GAP_MS = 900
/** No `postUpdate` for this long ⇒ render loop likely stuck — “Connecting back to satellite signal”. */
const SCENE_STALL_GAP_MS = 2800

const waypointHudOverlayVariants: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  fadeOut: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 1.35, ease: [0.33, 0, 0.2, 1] },
  },
}

export default function CesiumExplorer({ locale = 'en' }: CesiumExplorerProps) {
  const { push } = useNavigateWithPreloader()

  const containerRef      = useRef<HTMLDivElement>(null)
  const viewerRef         = useRef<CesiumViewer | null>(null)
  const groundHeightRef   = useRef<number>(0)
  const lastUserInputMsRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)
  const isFlyingRef       = useRef(false)
  const cancelWaypointAnimRef = useRef<(() => void) | null>(null)
  /** KML entities from `SUBDIVISION_KMZ_URL` — used for drill-pick hit-testing. */
  const subdivisionParcelEntitiesRef = useRef<Set<unknown>>(new Set())
  /** Cross-fade + visibility for subdivision vs Sociedades CN vs Sociedades CN-1 KMZs. */
  const kmlLayerAlphaRef = useRef<KmlLayerAlphas>(createInitialKmlLayerAlphas())

  const [activeWaypoint,        setActiveWaypoint]        = useState<Waypoint | null>(OVERVIEW_WAYPOINT ?? null)
  const [hoveredWaypoint,       setHoveredWaypoint]       = useState<Waypoint | null>(null)
  const [selectedParcelSale,    setSelectedParcelSale]    = useState<ParcelSalePick | null>(null)
  const [isLoaded,              setIsLoaded]              = useState(false)
  /** Set when Cesium fails to boot — never pair with `isLoaded` without a real Viewer. */
  const [bootError,             setBootError]             = useState<string | null>(null)
  const [isFlying,              setIsFlying]              = useState(false)
  const [timeOfDay,             setTimeOfDay]             = useState(14)
  const [altitudeAsl,           setAltitudeAsl]           = useState<number | null>(null)
  const [altitudeAgl,           setAltitudeAgl]           = useState<number | null>(null)
  // Incremented every time the viewer is (re)created; forces the tick useEffect
  // to restart even when isLoaded doesn't change (React Strict Mode double-init).
  const [viewerNonce, setViewerNonce] = useState(0)

  const menuFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waypointTargetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerButtonsRef = useRef(0)
  const postUpdateRemoveRef = useRef<(() => void) | null>(null)
  /** Canvas/window listeners registered with the current Viewer — cleared before destroy (never rely on useEffect + isLoaded alone). */
  const viewerInteractionsCleanupRef = useRef<(() => void) | null>(null)
  const postUpdateTickRef = useRef(0)
  const lastDebugMsRef = useRef(0)
  const lastHudCommitMsRef = useRef(0)
  const lastAslCommittedRef = useRef<number | null>(null)
  const lastAglCommittedRef = useRef<number | null>(null)
  const lastHudCommittedRef = useRef<{ cardinal: string; headingDeg: number; subsatLonDeg: number; subsatLatDeg: number } | null>(null)
  const lastTerrainSampleMsRef = useRef(0)
  const lastTerrainSampleLonLatRef = useRef<{ lon: number; lat: number } | null>(null)
  const lastOrbitHeadingRef = useRef<number | null>(null)
  const lastOrbitAppliedTickRef = useRef(0)
  const initSeqRef = useRef(0)
  const lastPostUpdateMsRef = useRef<number | null>(null)
  /** Updated at the start of every `scene.postUpdate` — used to detect long frames vs. total stalls. */
  const lastSceneHeartbeatAtMsRef = useRef<number | null>(null)
  const canvasPointerDownRef = useRef<{ x: number; y: number; t: number; button: number } | null>(null)
  const lastPoseLogMsRef = useRef(0)
  const lastPoseLoggedRef = useRef<string>('')
  const localOrbitRef = useRef<{
    active: boolean
    target?: unknown
    heading?: number
    pitch?: number
    roll?: number
    range?: number
    /** -1 clockwise, +1 counterclockwise */
    dir?: number
    /** speed model */
    radPerSecAt1km?: number
    radPerSecMin?: number
  }>({ active: false })
  /**
   * Last waypoint chosen in the Explore menu — **not** cleared when the info panel closes,
   * so canvas bindings (orbit mode, Shift+fly) still match the user’s scene intent.
   */
  const exploreMenuSelectionIdRef = useRef<string>(OVERVIEW_WAYPOINT?.id ?? 'overview')
  /** True after Shift+fly completes — west orbit around Cabo Negro site. */
  const site1OrbitActiveRef = useRef(false)
  /** True while `camera.flyTo` runs for site1 (pause auto-orbit). */
  const cameraFlightToSite1Ref = useRef(false)
  /** True while overview staged `flyTo` runs (pause drift / orbit). */
  const cameraOverviewFlightRef = useRef(false)
  /** Vista General click path: 0 = regional, 1 = approach, 2 = site vicinity. */
  const overviewStageIndexRef = useRef(0)
  /** Mirrors `overviewStageIndexRef` for locale sync and terminal copy. */
  const [overviewStageIndex, setOverviewStageIndex] = useState(0)
  const flyToCaboSite1Ref = useRef<(() => void) | null>(null)
  /** Assigned inside Cesium init (needs live Viewer + Cesium). */
  const flyOverviewToStageRef = useRef<((idx: number) => void) | null>(null)
  /** Wheel navigation can be triggered from menu or anywhere over the globe. */
  const navigateWaypointsByScrollRef = useRef<(direction: 1 | -1) => void>(() => {})
  const orbitMathRef = useRef<null | {
    getCaboNegroSite1Pose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => { longitude: number; latitude: number; height: number; heading: number; pitch: number; roll: number }
    getDefaultExplorePose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => { longitude: number; latitude: number; height: number; heading: number; pitch: number; roll: number }
    getOverviewCameraPose: (index: number) => { longitude: number; latitude: number; height: number; heading: number; pitch: number; roll: number }
    getOverviewFlightDurationSec: (fromStage: number, toStage: number) => number
    getSceneKeyframesForWaypoint: (wp: Waypoint) => CameraKeyframe[]
    sampleCameraSceneAt: (keyframes: CameraKeyframe[], elapsedSec: number) => { keyframe: CameraKeyframe; caption: string | undefined }
  }>(null)

  useEffect(() => {
    if (activeWaypoint) exploreMenuSelectionIdRef.current = activeWaypoint.id
  }, [activeWaypoint])

  const [imageryLabel, setImageryLabel] = useState('—')
  const [menuOpacity, setMenuOpacity] = useState(1)
  const [waypointTargetingKey, setWaypointTargetingKey] = useState(0)
  const [waypointTargetingVisible, setWaypointTargetingVisible] = useState(false)
  /** Globe is under heavy load (long frame gap) or the Cesium loop stopped updating. */
  const [globeRenderHint, setGlobeRenderHint] = useState<'idle' | 'heavy' | 'stalled'>('idle')
  const [sceneCaption, setSceneCaption] = useState<string | null>(null)
  const lastSceneCaptionRef = useRef<string | null>(null)
  /** Always resolve scene narrative with current `locale` (also used from long-lived Cesium callbacks). */
  const commitExploreCaptionRef = useRef<(raw: string | null) => void>(() => {})
  commitExploreCaptionRef.current = (raw: string | null) => {
    const next = resolveExploreCaption(locale, raw)
    if (next === lastSceneCaptionRef.current) return
    lastSceneCaptionRef.current = next
    setSceneCaption(next)
  }
  const [pointerClient, setPointerClient] = useState({ x: 0, y: 0, active: false })
  const [hud, setHud] = useState({
    cardinal: 'N',
    headingDeg: 0,
    subsatLonDeg: 0,
    subsatLatDeg: 0,
  })

  useEffect(() => {
    if (!lastHudCommittedRef.current) lastHudCommittedRef.current = hud
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const v = viewerRef.current
    const C = window.Cesium
    if (!isLoaded || !v || v.isDestroyed() || !C) return
    applyExplorerCameraInteractionScheme(C, v)
  }, [isLoaded, viewerNonce])

  /** Keep bottom-right terminal language in sync for overview stages and jump-only waypoints. */
  useEffect(() => {
    if (!isLoaded || !activeWaypoint) return
    if (activeWaypoint.id === 'overview') {
      commitExploreCaptionRef.current(`narr:overview-${overviewStageIndex}`)
      return
    }
    const jump: Record<string, string> = {
      'punta-arenas': 'narr:punta-arenas',
      'terminal-maritimo': 'narr:terminal-maritimo',
      'parque-logistico': 'narr:parque-logistico',
      'parque-tecnologico': 'narr:parque-tecnologico',
    }
    const k = jump[activeWaypoint.id]
    if (k) commitExploreCaptionRef.current(k)
  }, [isLoaded, locale, activeWaypoint?.id, overviewStageIndex])

  useEffect(() => {
    if (!isFlying) {
      setMenuOpacity(1)
      if (menuFadeTimerRef.current) {
        clearTimeout(menuFadeTimerRef.current)
        menuFadeTimerRef.current = null
      }
    } else {
      setMenuOpacity(0)
    }
  }, [isFlying])

  useEffect(() => {
    if (!isLoaded) {
      setGlobeRenderHint('idle')
      return
    }
    const poll = () => {
      if (document.visibilityState !== 'visible') {
        setGlobeRenderHint('idle')
        return
      }
      const last = lastSceneHeartbeatAtMsRef.current
      if (last == null) return
      const elapsed = performance.now() - last
      if (elapsed >= SCENE_STALL_GAP_MS) setGlobeRenderHint('stalled')
      else if (elapsed >= SCENE_BUSY_GAP_MS) setGlobeRenderHint('heavy')
      else setGlobeRenderHint('idle')
    }
    const id = window.setInterval(poll, 320)
    poll()
    return () => clearInterval(id)
  }, [isLoaded, viewerNonce])

  const bumpMenuFromActivity = useCallback(() => {
    if (!isFlyingRef.current) return
    setMenuOpacity(1)
    if (menuFadeTimerRef.current) clearTimeout(menuFadeTimerRef.current)
    menuFadeTimerRef.current = setTimeout(() => {
      if (isFlyingRef.current) setMenuOpacity(0)
    }, 2200)
  }, [])

  useEffect(() => () => {
    if (menuFadeTimerRef.current) clearTimeout(menuFadeTimerRef.current)
    if (waypointTargetingTimerRef.current) clearTimeout(waypointTargetingTimerRef.current)
  }, [])

  /** Sync button state from the OS — Cesium often stopPropagates canvas pointers, so the wrapper div never sees `pointerup` and `pointerButtonsRef` could stick non‑zero (auto-orbit stays off). */
  useEffect(() => {
    const sync = (e: PointerEvent) => {
      pointerButtonsRef.current = e.buttons
    }
    /** If the window loses focus mid–mouse-down, `buttons` can stay wrong until reset. */
    const resetButtons = () => {
      pointerButtonsRef.current = 0
    }
    window.addEventListener('pointerdown', sync, true)
    window.addEventListener('pointermove', sync, true)
    window.addEventListener('pointerup', sync, true)
    window.addEventListener('pointercancel', sync, true)
    window.addEventListener('blur', resetButtons)
    const onVis = () => {
      if (document.visibilityState === 'visible') pointerButtonsRef.current = 0
    }
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

  /** Fresh viewer / reload: ensure no stale “buttons down” from a previous gesture blocks auto-orbit. */
  useEffect(() => {
    if (!isLoaded) return
    pointerButtonsRef.current = 0
  }, [isLoaded, viewerNonce])

  useEffect(() => {
    if (!shouldDebugCesium()) return
    dbg('mount', { locale })
    return () => dbg('unmount')
  }, [locale])

  const flyToCaboNegroSite1 = useCallback(() => {
    const viewer = viewerRef.current
    const Cesium = window.Cesium
    if (!viewer || viewer.isDestroyed() || !Cesium || !OVERVIEW_WAYPOINT) return
    if (isFlyingRef.current) return
    try { viewer.camera.cancelFlight() } catch { /* noop */ }
    cameraFlightToSite1Ref.current = true
    site1OrbitActiveRef.current = false
    commitExploreCaptionRef.current('narr:site1-flight')
    const pose = orbitMathRef.current?.getCaboNegroSite1Pose(OVERVIEW_WAYPOINT)
    if (!pose) {
      console.warn('[CesiumExplorer] orbitMath not ready yet (site pose).')
      cameraFlightToSite1Ref.current = false
      return
    }
    try {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
        orientation: {
          heading: pose.heading,
          pitch: pose.pitch,
          roll: pose.roll,
        },
        duration: FLY_TO_SITE1_DURATION_SEC,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => {
          cameraFlightToSite1Ref.current = false
          site1OrbitActiveRef.current = true
        },
        cancel: () => {
          cameraFlightToSite1Ref.current = false
        },
      })
    } catch (err) {
      console.error('[CesiumExplorer] camera.flyTo (Cabo site) failed:', err)
      cameraFlightToSite1Ref.current = false
    }
  }, [])

  flyToCaboSite1Ref.current = flyToCaboNegroSite1

  // ── Waypoint scenes (keyframes) ─────────────────────────────────────────────
  const flyToWaypoint = useCallback((waypoint: Waypoint) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed()) return
    const Cesium = window.Cesium
    if (!Cesium) return
    const orbitMath = orbitMathRef.current
    if (!orbitMath) {
      console.warn('[CesiumExplorer] orbitMath not ready yet (waypoint).')
      return
    }
    if (waypointTargetingTimerRef.current) clearTimeout(waypointTargetingTimerRef.current)
    setWaypointTargetingKey((k) => k + 1)
    setWaypointTargetingVisible(true)
    waypointTargetingTimerRef.current = setTimeout(() => {
      setWaypointTargetingVisible(false)
      waypointTargetingTimerRef.current = null
    }, WAYPOINT_HUD_HOLD_MS)
    if (shouldDebugCesium()) dbg('menu:select-waypoint', { id: waypoint.id })

    applyKmlLayerTargetForWaypoint(waypoint.id, kmlLayerAlphaRef)

    site1OrbitActiveRef.current = false
    cameraFlightToSite1Ref.current = false
    exploreMenuSelectionIdRef.current = waypoint.id
    localOrbitRef.current.active = false
    try { viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY) } catch { /* noop */ }

    cancelWaypointAnimRef.current?.()
    cancelWaypointAnimRef.current = null
    try { viewer.camera.cancelFlight() } catch { /* noop */ }

    // Overview is a 3-stage ladder controlled by click/scroll (no auto fly-through).
    if (waypoint.id === 'overview') {
      isFlyingRef.current = false
      setIsFlying(false)
      setActiveWaypoint(waypoint)
      // Force a fly even if already at stage 0 (fly helper early-returns when indices match).
      if (overviewStageIndexRef.current === 0) overviewStageIndexRef.current = 1
      setOverviewStageIndex(0)
      commitExploreCaptionRef.current('narr:overview-0')
      flyOverviewToStageRef.current?.(0)
      overviewStageIndexRef.current = 0
      return
    }

    /** Curated poses that used to `setView` — now always `flyTo` so menu scroll never teleports. */
    const flyToPoseThenOrbit = (pose: FlyPose, narrKey: string, setupOrbit: () => void) => {
      isFlyingRef.current = true
      setIsFlying(true)
      setActiveWaypoint(waypoint)
      commitExploreCaptionRef.current(narrKey)
      localOrbitRef.current.active = false
      try { viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY) } catch { /* noop */ }
      const duration = estimateFlyDurationSec(viewer, Cesium, pose)
      try {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
          orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
          duration,
          easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
          complete: () => {
            isFlyingRef.current = false
            setIsFlying(false)
            setupOrbit()
            lastUserInputMsRef.current = performance.now()
          },
          cancel: () => {
            isFlyingRef.current = false
            setIsFlying(false)
          },
        })
      } catch (err) {
        console.error('[CesiumExplorer] camera.flyTo (waypoint orbit scene) failed:', err)
        isFlyingRef.current = false
        setIsFlying(false)
      }
    }

    if (waypoint.id === 'punta-arenas') {
      flyToPoseThenOrbit(
        { ...PUNTA_ARENAS_START_POSE },
        'narr:punta-arenas',
        () => {
          localOrbitRef.current.active = true
          localOrbitRef.current.target = undefined
          localOrbitRef.current.heading = PUNTA_ARENAS_START_POSE.heading
          localOrbitRef.current.pitch = PUNTA_ARENAS_START_POSE.pitch
          localOrbitRef.current.roll = PUNTA_ARENAS_START_POSE.roll
          localOrbitRef.current.range = undefined
          localOrbitRef.current.dir = -1
          localOrbitRef.current.radPerSecAt1km = PUNTA_ORBIT_RAD_PER_SEC_AT_1KM
          localOrbitRef.current.radPerSecMin = PUNTA_ORBIT_RAD_PER_SEC_MIN
        },
      )
      return
    }

    if (waypoint.id === 'parque-logistico') {
      flyToPoseThenOrbit(
        { ...LOGISTICS_PARK_START_POSE },
        'narr:parque-logistico',
        () => {
          localOrbitRef.current.active = true
          localOrbitRef.current.target = undefined
          localOrbitRef.current.heading = LOGISTICS_PARK_START_POSE.heading
          localOrbitRef.current.pitch = LOGISTICS_PARK_START_POSE.pitch
          localOrbitRef.current.roll = LOGISTICS_PARK_START_POSE.roll
          localOrbitRef.current.range = undefined
          localOrbitRef.current.dir = +1
          localOrbitRef.current.radPerSecAt1km = LOCAL_ORBIT_RAD_PER_SEC_AT_1KM
          localOrbitRef.current.radPerSecMin = LOCAL_ORBIT_RAD_PER_SEC_MIN
        },
      )
      return
    }

    if (waypoint.id === 'terminal-maritimo') {
      flyToPoseThenOrbit(
        { ...MARITIME_TERMINAL_START_POSE },
        'narr:terminal-maritimo',
        () => {
          localOrbitRef.current.active = true
          localOrbitRef.current.target = undefined
          localOrbitRef.current.heading = MARITIME_TERMINAL_START_POSE.heading
          localOrbitRef.current.pitch = MARITIME_TERMINAL_START_POSE.pitch
          localOrbitRef.current.roll = MARITIME_TERMINAL_START_POSE.roll
          localOrbitRef.current.range = undefined
          localOrbitRef.current.dir = +1
          localOrbitRef.current.radPerSecAt1km = LOCAL_ORBIT_RAD_PER_SEC_AT_1KM
          localOrbitRef.current.radPerSecMin = LOCAL_ORBIT_RAD_PER_SEC_MIN
        },
      )
      return
    }

    if (waypoint.id === 'parque-tecnologico') {
      flyToPoseThenOrbit(
        { ...TECHNOLOGY_PARK_START_POSE },
        'narr:parque-tecnologico',
        () => {
          localOrbitRef.current.active = true
          localOrbitRef.current.target = undefined
          localOrbitRef.current.heading = TECHNOLOGY_PARK_START_POSE.heading
          localOrbitRef.current.pitch = TECHNOLOGY_PARK_START_POSE.pitch
          localOrbitRef.current.roll = TECHNOLOGY_PARK_START_POSE.roll
          localOrbitRef.current.range = undefined
          localOrbitRef.current.dir = +1
          localOrbitRef.current.radPerSecAt1km = LOCAL_ORBIT_RAD_PER_SEC_AT_1KM
          localOrbitRef.current.radPerSecMin = LOCAL_ORBIT_RAD_PER_SEC_MIN
        },
      )
      return
    }

    // Start scene, but keep UI/inputs responsive; user can interrupt anytime.
    isFlyingRef.current = true
    setIsFlying(true)
    setActiveWaypoint(waypoint)
    if (waypoint.id !== 'overview') {
      commitExploreCaptionRef.current(null)
    }

    const keyframes = orbitMath.getSceneKeyframesForWaypoint(waypoint)
    const durationSec = sceneDurationSec(keyframes)
    const t0 = performance.now()
    const rafRef = { id: 0 }
    let lastSetViewMs = 0

    const finish = () => {
      cancelWaypointAnimRef.current = null
      isFlyingRef.current = false
      setIsFlying(false)
      if (waypoint.id === 'overview') {
        const lastStage = 2
        overviewStageIndexRef.current = lastStage
        setOverviewStageIndex(lastStage)
        commitExploreCaptionRef.current('narr:overview-2')
        const v = viewerRef.current
        const pose = orbitMathRef.current?.getOverviewCameraPose(lastStage)
        if (v && !v.isDestroyed() && pose) {
          localOrbitRef.current.active = true
          localOrbitRef.current.target = undefined
          localOrbitRef.current.heading = pose.heading
          localOrbitRef.current.pitch = pose.pitch
          localOrbitRef.current.roll = pose.roll
          localOrbitRef.current.range = undefined
          localOrbitRef.current.dir = AUTO_ORBIT_WEST_SIGN
          localOrbitRef.current.radPerSecAt1km = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM
          localOrbitRef.current.radPerSecMin = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN
          lastUserInputMsRef.current = performance.now()
        }
      } else {
        commitExploreCaptionRef.current(null)
      }
    }

    const step = () => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) {
        finish()
        return
      }
      try {
        const now = performance.now()
        const elapsed = (now - t0) / 1000
        const clampedElapsed = Math.min(elapsed, durationSec)

        const { keyframe, caption } = orbitMath.sampleCameraSceneAt(keyframes, clampedElapsed)
        commitExploreCaptionRef.current(caption ?? null)

        if (elapsed >= durationSec) {
          viewerRef.current.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
              keyframe.longitude, keyframe.latitude, keyframe.height,
            ),
            orientation: {
              heading: keyframe.heading,
              pitch: keyframe.pitch,
              roll: keyframe.roll,
            },
          })
          finish()
          return
        }

        if (now - lastSetViewMs < WAYPOINT_SETVIEW_MIN_INTERVAL_MS) {
          rafRef.id = requestAnimationFrame(step)
          return
        }
        lastSetViewMs = now

        viewerRef.current.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            keyframe.longitude, keyframe.latitude, keyframe.height,
          ),
          orientation: {
            heading: keyframe.heading,
            pitch: keyframe.pitch,
            roll: keyframe.roll,
          },
        })

        rafRef.id = requestAnimationFrame(step)
      } catch (err) {
        console.error('[CesiumExplorer] waypoint scene step failed:', err)
        finish()
      }
    }

    try {
      const first = keyframes[0]
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(first.longitude, first.latitude, first.height),
        orientation: {
          heading: first.heading,
          pitch: first.pitch,
          roll: first.roll,
        },
      })
      commitExploreCaptionRef.current(first.caption ?? null)
    } catch (err) {
      console.error('[CesiumExplorer] waypoint scene start failed:', err)
      finish()
      return
    }

    rafRef.id = requestAnimationFrame(step)
    /** Must reset flight UI — init effect cleanup / Strict Mode only cancelled rAF before, leaving `isFlying` stuck. */
    cancelWaypointAnimRef.current = () => {
      cancelAnimationFrame(rafRef.id)
      finish()
    }
  }, [])

  const navigateWaypointsByScroll = useCallback((direction: 1 | -1) => {
    // Don't interrupt an in-progress camera flight with wheel spam; let the fly complete.
    if (isFlyingRef.current || cameraOverviewFlightRef.current || cameraFlightToSite1Ref.current) return

    // Special: overview has 3 internal stages; scroll moves through them first.
    if (activeWaypoint?.id === 'overview') {
      const stage = overviewStageIndexRef.current ?? 0
      const nextStage = stage + direction
      if (nextStage >= 0 && nextStage <= 2) {
        overviewStageIndexRef.current = nextStage
        setOverviewStageIndex(nextStage)
        commitExploreCaptionRef.current(`narr:overview-${nextStage}`)
        flyOverviewToStageRef.current?.(nextStage)
        return
      }
      // After stage 2, keep scrolling → terminal.
      if (stage === 2 && direction === 1) {
        const terminal = WAYPOINTS.find(w => w.id === 'terminal-maritimo')
        if (terminal) flyToWaypoint(terminal)
      }
      return
    }

    const curIdx = activeWaypoint ? WAYPOINTS.findIndex(w => w.id === activeWaypoint.id) : 0
    const i = curIdx < 0 ? 0 : curIdx
    const next = Math.max(0, Math.min(WAYPOINTS.length - 1, i + direction))
    if (next === i) return
    flyToWaypoint(WAYPOINTS[next])
  }, [activeWaypoint?.id, flyToWaypoint])
  navigateWaypointsByScrollRef.current = navigateWaypointsByScroll

  // ── Time-of-day sync ────────────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium) return
    const Cesium = window.Cesium
    const date = new Date()
    date.setUTCHours((timeOfDay + 3) % 24, 0, 0, 0)
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
  }, [timeOfDay])

  // ── Cesium init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    let viewer: CesiumViewer | null = null
    const mySeq = ++initSeqRef.current
    let cancelled = false

    const initCesium = async () => {
      setBootError(null)
      dbg('init:start', { seq: mySeq })
      const Cesium = await import('cesium')
      if (cancelled || initSeqRef.current !== mySeq) return
      // IMPORTANT: orbitMath has a runtime dependency on `cesium`. Keep it out of the initial bundle
      // by importing it only after Cesium is requested.
      if (!orbitMathRef.current) {
        const orbitMath = await import('@/lib/cesium/orbitMath')
        if (cancelled || initSeqRef.current !== mySeq) return
        orbitMathRef.current = {
          getCaboNegroSite1Pose: orbitMath.getCaboNegroSite1Pose,
          getDefaultExplorePose: orbitMath.getDefaultExplorePose,
          getOverviewCameraPose: orbitMath.getOverviewCameraPose,
          getOverviewFlightDurationSec: orbitMath.getOverviewFlightDurationSec,
          getSceneKeyframesForWaypoint: orbitMath.getSceneKeyframesForWaypoint,
          sampleCameraSceneAt: orbitMath.sampleCameraSceneAt,
        }
        dbg('init:orbitMath-loaded')
      }

      window.CESIUM_BASE_URL = `${window.location.origin}/_next/static/cesium/`
      Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

      if (!containerRef.current) return
      if (cancelled || initSeqRef.current !== mySeq) return

      const isMobile = window.innerWidth < 768

      // Primary: Cesium Ion Bing Maps aerial (asset 2). Fallback: ArcGIS, then Natural Earth.
      let baseLayer: InstanceType<typeof Cesium.ImageryLayer>
      try {
        const bingProvider = await Cesium.IonImageryProvider.fromAssetId(2)
        baseLayer = new Cesium.ImageryLayer(bingProvider)
        setImageryLabel('CESIUM ION · BING AERIAL')
        console.info('[CesiumExplorer] Imagery: OK — Cesium Ion Bing (asset 2)')
      } catch (err) {
        console.warn('[CesiumExplorer] Ion Bing imagery unavailable, trying ArcGIS.', err)
        try {
          const arcGisProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          )
          baseLayer = new Cesium.ImageryLayer(arcGisProvider)
          setImageryLabel('ARCGIS · WORLD IMAGERY')
          console.info('[CesiumExplorer] Imagery: OK — ArcGIS World Imagery (fallback)')
        } catch {
          const tmsProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'), { fileExtension: 'jpg' },
          )
          baseLayer = new Cesium.ImageryLayer(tmsProvider)
          setImageryLabel('NATURAL EARTH II')
          console.info('[CesiumExplorer] Imagery: OK — Natural Earth II (bundled fallback)')
        }
      }

      let terrainProvider: InstanceType<typeof Cesium.TerrainProvider>
      try {
        terrainProvider = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: false,
        })
      } catch (err) {
        console.warn('[CesiumExplorer] World terrain unavailable.', err)
        terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }
      if (cancelled || initSeqRef.current !== mySeq) return

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
      dbg('init:viewer-created', {
        isMobile,
        canvas: { w: viewer.scene.canvas?.clientWidth, h: viewer.scene.canvas?.clientHeight },
      })
      if (cancelled || initSeqRef.current !== mySeq) {
        try { viewer.destroy() } catch { /* noop */ }
        return
      }

      // Defer OSM buildings — don't block first paint; add lazily after globe is interactive
      const osmViewer = viewer
      setTimeout(async () => {
        if (cancelled || initSeqRef.current !== mySeq) return
        if (!osmViewer || osmViewer.isDestroyed()) return
        try {
          osmViewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync())
        } catch { /* optional */ }
      }, 3000)

      viewerRef.current = viewer
      window.Cesium     = Cesium
      if (cancelled || initSeqRef.current !== mySeq) return

      applyExplorerCameraInteractionScheme(Cesium, viewer)

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
      viewer.scene.fog.enabled           = false
      viewer.scene.globe.depthTestAgainstTerrain = true

      viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.04, 0.1, 1.0)

      // Water animation: use Cesium's built-in ocean effect (water mask),
      // not a full-globe material (which can wash out imagery/terrain).
      try {
        viewer.scene.globe.showWaterEffect = true
        viewer.scene.globe.material = undefined
      } catch { /* optional */ }

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

      // Lower resolution scale slightly — vintage overlay masks softness intentionally
      // Raise globe SSE to reduce tile refinement depth (fewer concurrent tile fetches)
      viewer.resolutionScale = isMobile ? 0.70 : 0.88
      viewer.scene.globe.maximumScreenSpaceError = isMobile ? 5 : 3
      if (!isMobile) viewer.scene.globe.tileCacheSize = 200

      addBoatAnimation(viewer, Cesium)
      addSiteMarkers(viewer, Cesium)

      subdivisionParcelEntitiesRef.current = new Set()
      kmlLayerAlphaRef.current = createInitialKmlLayerAlphas()
      applyKmlLayerTargetForWaypoint(exploreMenuSelectionIdRef.current, kmlLayerAlphaRef)

      const viewerForKml = viewer
      const fillBase = Cesium.Color.fromCssColorString('#00e5ff')
      const lineBase = Cesium.Color.fromCssColorString('#00fff0')
      const outlineBase = Cesium.Color.fromCssColorString('#00d4ff')

      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SUBDIVISION_KMZ_URL, {
            camera: viewerForKml.scene.camera,
            canvas: viewerForKml.scene.canvas,
          })
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)

          const entitySet = new Set<unknown>()
          for (const entity of ds.entities.values) {
            entitySet.add(entity)
            if (entity.polygon) {
              entity.polygon.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(
                  () => fillBase.withAlpha(0.38 * kmlLayerAlphaRef.current.subdivision),
                  false,
                ),
              )
              entity.polygon.outline = new Cesium.ConstantProperty(true)
              entity.polygon.outlineColor = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(
                  () => outlineBase.withAlpha(0.95 * kmlLayerAlphaRef.current.subdivision),
                  false,
                ),
              )
            }
            if (entity.polyline) {
              entity.polyline.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(
                  () => lineBase.withAlpha(0.92 * kmlLayerAlphaRef.current.subdivision),
                  false,
                ),
              )
              entity.polyline.width = new Cesium.ConstantProperty(5)
              entity.polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC)
              entity.polyline.clampToGround = new Cesium.ConstantProperty(true)
            }
            if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false)
            if (entity.label) entity.label.show = new Cesium.ConstantProperty(false)
          }
          subdivisionParcelEntitiesRef.current = entitySet
          dbg('init:subdivision-kmz', { entities: ds.entities.values.length })
        } catch (err) {
          warnOnce('subdivision-kmz', 'Subdivision KMZ failed to load.', err)
        }
      })()

      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SOCIEDADES_CN_KMZ_URL, {
            camera: viewerForKml.scene.camera,
            canvas: viewerForKml.scene.canvas,
          })
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)
          ds.show = false
          await applySociedadesKmlStyling(
            viewerForKml,
            Cesium,
            ds,
            () => kmlLayerAlphaRef.current.sociedadesCn,
            SOCIEDADES_WALL_HEIGHT_M,
          )
          ds.show = true
          dbg('init:sociedades-cn-kmz', { entities: ds.entities.values.length })
        } catch (err) {
          warnOnce('sociedades-cn-kmz', 'Sociedades CN KMZ failed to load.', err)
        }
      })()

      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SOCIEDADES_CN1_KMZ_URL, {
            camera: viewerForKml.scene.camera,
            canvas: viewerForKml.scene.canvas,
          })
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)
          ds.show = false
          await applySociedadesKmlStyling(
            viewerForKml,
            Cesium,
            ds,
            () => kmlLayerAlphaRef.current.sociedadesCn1,
            SOCIEDADES_WALL_HEIGHT_M,
          )
          ds.show = true
          dbg('init:sociedades-cn1-kmz', { entities: ds.entities.values.length })
        } catch (err) {
          warnOnce('sociedades-cn1-kmz', 'Sociedades CN-1 KMZ failed to load.', err)
        }
      })()

      const scratchNormal = new Cesium.Cartesian3()
      const pickFallback = new Cesium.Cartesian3()
      const centerPx = new Cesium.Cartesian2()
      const scratchCamCarto = new Cesium.Cartographic()
      const terrainSampleCarto = new Cesium.Cartographic()
      let hudPostSkip = 0
      let lastTerrainUnderCamMs = 0

      function onPostUpdate() {
        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return

        lastSceneHeartbeatAtMsRef.current = performance.now()

        stepKmlLayerAlphas(kmlLayerAlphaRef)

        postUpdateTickRef.current++
        const scene = v.scene
        const cam = v.camera
        const ellipsoid = scene.globe.ellipsoid

        // ── Auto drift (westward translation) / Punta orbit ──────────────────
        // Pause while user is interacting and during scripted camera moves.
        if (!isFlyingRef.current && !cameraFlightToSite1Ref.current && !cameraOverviewFlightRef.current) {
          const w = scene.canvas.clientWidth
          const h = scene.canvas.clientHeight
          const idleEnough = (performance.now() - lastUserInputMsRef.current) >= DRIFT_IDLE_AFTER_INPUT_MS
          const notDragging = pointerButtonsRef.current === 0
          if (w >= 2 && h >= 2 && idleEnough && notDragging) {
            // dt in seconds (postUpdate cadence can vary under load)
            const tNow = performance.now()
            const tPrev = lastPostUpdateMsRef.current ?? tNow
            lastPostUpdateMsRef.current = tNow
            const dt = Math.max(0, Math.min(0.15, (tNow - tPrev) / 1000))

            if (localOrbitRef.current.active) {
              // Orbit around the current viewport center target (picked once).
              if (!localOrbitRef.current.target) {
                C.Cartesian2.fromElements(w * 0.5, h * 0.5, centerPx)
                let surfacePoint = cam.pickEllipsoid(centerPx, ellipsoid)
                if (!C.defined(surfacePoint)) {
                  C.Cartographic.fromCartesian(cam.position, ellipsoid, scratchCamCarto)
                  C.Cartesian3.fromRadians(
                    scratchCamCarto.longitude,
                    scratchCamCarto.latitude,
                    0,
                    ellipsoid,
                    pickFallback,
                  )
                  surfacePoint = pickFallback
                }
                localOrbitRef.current.target = surfacePoint
                localOrbitRef.current.range = C.Cartesian3.distance(cam.position, surfacePoint!)
              }

              C.Cartographic.fromCartesian(cam.position, ellipsoid, scratchCamCarto)
              const asl = scratchCamCarto.height
              const at1km = localOrbitRef.current.radPerSecAt1km ?? LOCAL_ORBIT_RAD_PER_SEC_AT_1KM
              const min = localOrbitRef.current.radPerSecMin ?? LOCAL_ORBIT_RAD_PER_SEC_MIN
              const dir = localOrbitRef.current.dir ?? +1
              const radPerSec = Math.max(
                min,
                Math.min(at1km, at1km * (1200 / Math.max(600, asl))),
              )
              localOrbitRef.current.heading = (localOrbitRef.current.heading ?? cam.heading) + dir * radPerSec * dt
              const heading = localOrbitRef.current.heading!
              const pitch = localOrbitRef.current.pitch ?? cam.pitch
              const range = localOrbitRef.current.range ?? C.Cartesian3.distance(cam.position, localOrbitRef.current.target as any)

              // Use lookAt for a stable orbit around `target`.
              cam.lookAt(localOrbitRef.current.target as any, new C.HeadingPitchRange(heading, pitch, range))
              lastOrbitAppliedTickRef.current = postUpdateTickRef.current
            } else {
              C.Cartographic.fromCartesian(cam.position, ellipsoid, scratchCamCarto)
              const asl = scratchCamCarto.height
              const mps = computeWestDriftMps(asl)

              // Move west along the parallel at constant ellipsoid height.
              const lat = scratchCamCarto.latitude
              const cosLat = Math.max(1e-6, Math.cos(lat))
              const meters = mps * dt
              const dLon = -meters / (ellipsoid.maximumRadius * cosLat)

              const lon2 = scratchCamCarto.longitude + dLon
              C.Cartesian3.fromRadians(lon2, lat, asl, ellipsoid, pickFallback)
              cam.position = pickFallback
              lastOrbitAppliedTickRef.current = postUpdateTickRef.current
            }
          }
        } else {
          lastPostUpdateMsRef.current = null
        }

        const now = performance.now()
        if (shouldDebugCesium() && now - lastDebugMsRef.current > 2500) {
          lastDebugMsRef.current = now
          const headingNow = cam.heading
          const prevHeading = lastOrbitHeadingRef.current
          const headingDelta =
            prevHeading === null ? null : Number((((headingNow - prevHeading + Math.PI) % (2 * Math.PI)) - Math.PI).toFixed(6))
          lastOrbitHeadingRef.current = headingNow
          dbg('tick', {
            tick: postUpdateTickRef.current,
            canvas: { w: scene.canvas.clientWidth, h: scene.canvas.clientHeight },
            flying: isFlyingRef.current,
            flightSite: cameraFlightToSite1Ref.current,
            overviewFlight: cameraOverviewFlightRef.current,
            buttons: pointerButtonsRef.current,
            heading: Number(cam.heading.toFixed(3)),
            headingDelta,
            orbitAppliedTick: lastOrbitAppliedTickRef.current,
          })
          if (scene.canvas.clientWidth < 2 || scene.canvas.clientHeight < 2) {
            warnOnce('canvas-0', 'canvas is ~0x0; WebGL will break. Check layout/resize.', {
              w: scene.canvas.clientWidth, h: scene.canvas.clientHeight,
            })
          }
        }
        C.Cartographic.fromCartesian(cam.position, ellipsoid, scratchCamCarto)
        const aslRounded = Math.round(scratchCamCarto.height)

        // Optional pose logger for waypoint tuning.
        if (shouldLogCameraPose()) {
          const t = performance.now()
          if (t - lastPoseLogMsRef.current >= 700) {
            lastPoseLogMsRef.current = t
            const pose = {
              longitude: Number(C.Math.toDegrees(scratchCamCarto.longitude).toFixed(6)),
              latitude: Number(C.Math.toDegrees(scratchCamCarto.latitude).toFixed(6)),
              height: Math.round(scratchCamCarto.height),
              heading: Number(cam.heading.toFixed(6)),
              pitch: Number(cam.pitch.toFixed(6)),
              roll: Number(cam.roll.toFixed(6)),
            }
            const key = JSON.stringify(pose)
            if (key !== lastPoseLoggedRef.current) {
              lastPoseLoggedRef.current = key
              // eslint-disable-next-line no-console
              console.log('[CesiumExplorer] camera pose', pose)
            }
          }
        }

        // ── UI sampling (React state) ─────────────────────────────────────────
        // Keep Cesium rendering hot; commit to React at a low cadence and only when values change.
        if (++hudPostSkip >= 2) {
          hudPostSkip = 0

          const commitDue = now - lastHudCommitMsRef.current >= 220
          if (commitDue) {
            lastHudCommitMsRef.current = now

            // ASL always updates; AGL only matters near the surface (and only shown under 5km).
            if (lastAslCommittedRef.current !== aslRounded) {
              lastAslCommittedRef.current = aslRounded
              setAltitudeAsl(aslRounded)
            }

            const wantAgl = aslRounded < 5000
            if (wantAgl) {
              const agl = Math.max(0, aslRounded - Math.round(groundHeightRef.current))
              if (lastAglCommittedRef.current !== agl) {
                lastAglCommittedRef.current = agl
                setAltitudeAgl(agl)
              }
            } else if (lastAglCommittedRef.current !== null) {
              lastAglCommittedRef.current = null
              setAltitudeAgl(null)
            }

            const lonDeg = C.Math.toDegrees(scratchCamCarto.longitude)
            const latDeg = C.Math.toDegrees(scratchCamCarto.latitude)
            const nextHud = {
              cardinal: cardinal8(cam.heading),
              headingDeg: Number(C.Math.toDegrees(cam.heading).toFixed(1)),
              subsatLonDeg: Number(lonDeg.toFixed(5)),
              subsatLatDeg: Number(latDeg.toFixed(5)),
            }
            const prevHud = lastHudCommittedRef.current ?? hud
            if (
              nextHud.cardinal !== prevHud.cardinal ||
              nextHud.headingDeg !== prevHud.headingDeg ||
              nextHud.subsatLonDeg !== prevHud.subsatLonDeg ||
              nextHud.subsatLatDeg !== prevHud.subsatLatDeg
            ) {
              lastHudCommittedRef.current = nextHud
              setHud(nextHud)
            }
          }
        }

        // ── Terrain sampling (AGL) ────────────────────────────────────────────
        // Expensive: only sample when AGL could be displayed (low altitude) and when the camera moved.
        // Also keep a minimum cadence to reduce network + CPU churn.
        if (aslRounded < 5000) {
          const movedEnough = (() => {
            const last = lastTerrainSampleLonLatRef.current
            if (!last) return true
            const dLon = scratchCamCarto.longitude - last.lon
            const dLat = scratchCamCarto.latitude - last.lat
            // ~0.001 rad ≈ 6.4km on Earth; use smaller so AGL tracks while moving, but not every frame.
            return (dLon * dLon + dLat * dLat) >= (0.00015 * 0.00015)
          })()

          if (
            movedEnough &&
            now - lastTerrainSampleMsRef.current >= Math.max(800, TERRAIN_UNDER_CAMERA_MS)
          ) {
            lastTerrainSampleMsRef.current = now
            lastTerrainSampleLonLatRef.current = {
              lon: scratchCamCarto.longitude,
              lat: scratchCamCarto.latitude,
            }

            // Keep legacy limiter for safety; this code path is now gated tighter.
            if (now - lastTerrainUnderCamMs >= TERRAIN_UNDER_CAMERA_MS) {
              lastTerrainUnderCamMs = now
              C.Cartographic.fromRadians(
                scratchCamCarto.longitude,
                scratchCamCarto.latitude,
                0,
                terrainSampleCarto,
              )
              const positions = [terrainSampleCarto]
              C.sampleTerrainMostDetailed(v.terrainProvider, positions)
                .then((sampled: unknown[]) => {
                  groundHeightRef.current = (sampled[0] as { height?: number })?.height ?? 0
                })
                .catch(() => { /* ellipsoid / unsupported */ })
            }
          }
        }
      }

      viewer.scene.postUpdate.addEventListener(onPostUpdate)
      const viewerForPost = viewer
      postUpdateRemoveRef.current = () => {
        if (viewerForPost && !viewerForPost.isDestroyed()) {
          viewerForPost.scene.postUpdate.removeEventListener(onPostUpdate)
        }
      }
      dbg('init:postUpdate-attached')
      if (cancelled || initSeqRef.current !== mySeq) return

      // ── Initial camera position (explore default — matches authored pose sample) ─
      if (OVERVIEW_WAYPOINT) {
        const pose = orbitMathRef.current?.getDefaultExplorePose(OVERVIEW_WAYPOINT)
        if (!pose) throw new Error('[CesiumExplorer] orbitMath not ready (default pose).')
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
          orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
        })
        overviewStageIndexRef.current = 0
        cameraOverviewFlightRef.current = false
        localOrbitRef.current.active = true
        localOrbitRef.current.target = undefined
        localOrbitRef.current.heading = pose.heading
        localOrbitRef.current.pitch = pose.pitch
        localOrbitRef.current.roll = pose.roll
        localOrbitRef.current.range = undefined
        localOrbitRef.current.dir = AUTO_ORBIT_WEST_SIGN
        localOrbitRef.current.radPerSecAt1km = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM
        localOrbitRef.current.radPerSecMin = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN
        lastUserInputMsRef.current = performance.now()
      } else {
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            PUNTA_ARENAS_START.longitude, PUNTA_ARENAS_START.latitude, PUNTA_ARENAS_START.height,
          ),
          orientation: { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 },
        })
      }

      requestAnimationFrame(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
        requestAnimationFrame(() => {
          const v2 = viewerRef.current
          if (!v2 || v2.isDestroyed()) return
          v2.resize()
        })
      })
      dbg('init:setView+resize-kick', {
        canvas: { w: viewer.scene.canvas?.clientWidth, h: viewer.scene.canvas?.clientHeight },
      })
      if (cancelled || initSeqRef.current !== mySeq) return

      // ── Canvas + window: zoom / pick / menu activity (same Viewer lifetime as postUpdate — no isLoaded/viewerRef race) ─
      viewerInteractionsCleanupRef.current?.()
      viewerInteractionsCleanupRef.current = null
      subdivisionParcelEntitiesRef.current = new Set()
      setSelectedParcelSale(null)

      const canvas = viewer.scene.canvas
      const mousePx = new Cesium.Cartesian2()

      const onContextMenu = (e: Event) => {
        e.preventDefault()
      }

      const flyOverviewToStage = (targetIdx: number) => {
        const v = viewerRef.current
        const C = window.Cesium
        const om = orbitMathRef.current
        if (!v || v.isDestroyed() || !C || !om) return
        const maxStage = 2
        const clamped = Math.max(0, Math.min(maxStage, Math.floor(targetIdx)))
        if (clamped === overviewStageIndexRef.current) return
        try { v.camera.cancelFlight() } catch { /* noop */ }
        cameraOverviewFlightRef.current = true
        localOrbitRef.current.active = false
        try { v.camera.lookAtTransform(C.Matrix4.IDENTITY) } catch { /* noop */ }
        const pose = om.getOverviewCameraPose(clamped)
        const duration = om.getOverviewFlightDurationSec(overviewStageIndexRef.current, clamped)
        setOverviewStageIndex(clamped)
        commitExploreCaptionRef.current(`narr:overview-${clamped}`)
        try {
          v.camera.flyTo({
            destination: C.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
            orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
            duration,
            easingFunction: C.EasingFunction.CUBIC_IN_OUT,
            complete: () => {
              cameraOverviewFlightRef.current = false
              overviewStageIndexRef.current = clamped
              commitExploreCaptionRef.current(`narr:overview-${clamped}`)
              localOrbitRef.current.active = true
              localOrbitRef.current.target = undefined
              localOrbitRef.current.heading = pose.heading
              localOrbitRef.current.pitch = pose.pitch
              localOrbitRef.current.roll = pose.roll
              localOrbitRef.current.range = undefined
              localOrbitRef.current.dir = AUTO_ORBIT_WEST_SIGN
              localOrbitRef.current.radPerSecAt1km = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM
              localOrbitRef.current.radPerSecMin = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN
              lastUserInputMsRef.current = performance.now()
            },
            cancel: () => {
              cameraOverviewFlightRef.current = false
            },
          })
        } catch (err) {
          console.error('[CesiumExplorer] overview flyTo failed:', err)
          cameraOverviewFlightRef.current = false
        }
      }
      flyOverviewToStageRef.current = flyOverviewToStage

      const onCanvasClick = (e: MouseEvent) => {
        if (shouldDebugCesium()) dbg('canvas:click', { btn: e.button, shift: e.shiftKey, ctrl: e.ctrlKey, meta: e.metaKey })

        if (isFlyingRef.current) return
        if (cameraOverviewFlightRef.current) return
        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return

        const parcelEntities = subdivisionParcelEntitiesRef.current
        const subdivisionVisible = kmlLayerAlphaRef.current.subdivision > 0.45
        if (parcelEntities.size > 0 && subdivisionVisible) {
          const boundsRect = canvas.getBoundingClientRect()
          C.Cartesian2.fromElements(e.clientX - boundsRect.left, e.clientY - boundsRect.top, mousePx)
          const drill = v.scene.drillPick(mousePx, 24)
          for (let di = 0; di < drill.length; di++) {
            const id = drill[di]?.id
            if (id && parcelEntities.has(id)) {
              const ll = centroidLonLatFromEntity(C, v, id)
              setSelectedParcelSale({
                title: entityDisplayName(C, v, id),
                longitude: ll?.lon ?? -70.86,
                latitude: ll?.lat ?? -52.93,
              })
              lastUserInputMsRef.current = performance.now()
              return
            }
          }
        }

        // Any click-zoom should cancel local orbit/lookAt so it can't overwrite the snap.
        localOrbitRef.current.active = false
        try { v.camera.lookAtTransform(C.Matrix4.IDENTITY) } catch { /* noop */ }

        const overviewMenu = exploreMenuSelectionIdRef.current === 'overview'
        const wantFlySite =
          overviewMenu &&
          !site1OrbitActiveRef.current &&
          !isFlyingRef.current &&
          e.shiftKey
        if (wantFlySite && flyToCaboSite1Ref.current) {
          flyToCaboSite1Ref.current()
          lastUserInputMsRef.current = performance.now()
          return
        }

        if (overviewMenu && !e.shiftKey) {
          const next = overviewStageIndexRef.current + 1
          if (next <= 2) {
            flyOverviewToStage(next)
            lastUserInputMsRef.current = performance.now()
          }
          return
        }

        // Staged zoom (non–Vista General): re-centers Cabo Negro (Site 1) in the viewport.
        // Cursor position is ignored (users can click slightly off-center and still keep Cabo Negro centered).
        const SITE1_DEG = { lon: -70.851937, lat: -52.927339 }
        const focusLon = C.Math.toRadians(SITE1_DEG.lon)
        const focusLat = C.Math.toRadians(SITE1_DEG.lat)

        C.Cartographic.fromCartesian(v.camera.position, v.scene.globe.ellipsoid, scratchCamCarto)
        const h0 = scratchCamCarto.height
        const before = Math.round(h0)
        if (h0 > ZOOM_STAGE_DECIDE_ABOVE_ASL_M) {
          // Stage 1: 100km above Cabo Negro (Site 1).
          v.camera.setView({
            destination: C.Cartesian3.fromRadians(
              focusLon,
              focusLat,
              ZOOM_STAGE_1_TARGET_ASL_M,
              v.scene.globe.ellipsoid,
            ),
            orientation: {
              heading: v.camera.heading,
              pitch: v.camera.pitch,
              roll: v.camera.roll,
            },
          })
        } else if (h0 <= ZOOM_STAGE_2_TRIGGER_BELOW_ASL_M) {
          // Stage 2: 3km above Cabo Negro (Site 1), preserving the current camera angle.
          v.camera.setView({
            destination: C.Cartesian3.fromRadians(focusLon, focusLat, ZOOM_STAGE_2_TARGET_ASL_M, v.scene.globe.ellipsoid),
            orientation: {
              heading: v.camera.heading,
              pitch: v.camera.pitch,
              roll: v.camera.roll,
            },
          })
        }
        C.Cartographic.fromCartesian(v.camera.position, v.scene.globe.ellipsoid, scratchCamCarto)
        const after = Math.round(scratchCamCarto.height)
        if (shouldDebugCesium()) dbg('zoom:in', { before, after, mode: 'staged' })
        lastUserInputMsRef.current = performance.now()
      }

      const onAuxClickZoom = (e: MouseEvent) => {
        if (e.button !== 2) return
        if (shouldDebugCesium()) dbg('canvas:auxclick', { btn: e.button })
        if (isFlyingRef.current) return
        if (cameraOverviewFlightRef.current) return
        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return
        localOrbitRef.current.active = false
        try { v.camera.lookAtTransform(C.Matrix4.IDENTITY) } catch { /* noop */ }

        if (exploreMenuSelectionIdRef.current === 'overview') {
          const prev = overviewStageIndexRef.current - 1
          if (prev >= 0) {
            flyOverviewToStage(prev)
            lastUserInputMsRef.current = performance.now()
          }
          return
        }

        // Simple zoom-out: move up a big chunk in ASL, keeping Cabo Negro centered.
        const SITE1_DEG = { lon: -70.851937, lat: -52.927339 }
        C.Cartographic.fromCartesian(v.camera.position, v.scene.globe.ellipsoid, scratchCamCarto)
        const before = Math.round(scratchCamCarto.height)
        const hTarget = Math.min(CLICK_ZOOM_ASL_MAX_M, Math.max(before + 250_000, ZOOM_STAGE_1_TARGET_ASL_M))
        v.camera.setView({
          destination: C.Cartesian3.fromDegrees(SITE1_DEG.lon, SITE1_DEG.lat, hTarget),
          orientation: {
            heading: v.camera.heading,
            pitch: v.camera.pitch,
            roll: v.camera.roll,
          },
        })
        C.Cartographic.fromCartesian(v.camera.position, v.scene.globe.ellipsoid, scratchCamCarto)
        const after = Math.round(scratchCamCarto.height)
        if (shouldDebugCesium()) dbg('zoom:out', { before, after, mode: 'asl-step' })
        lastUserInputMsRef.current = performance.now()
      }

      const markInput = () => {
        lastUserInputMsRef.current = performance.now()
        // Any deliberate interaction cancels the current scene so the user can act immediately.
        cancelWaypointAnimRef.current?.()
        localOrbitRef.current.active = false
        const v = viewerRef.current
        if (v && !v.isDestroyed()) {
          try { v.camera.cancelFlight() } catch { /* noop */ }
        }
        cameraOverviewFlightRef.current = false
      }
      const onCanvasPointerDown = () => { markInput() }
      // Wheel is reserved for waypoint navigation; ctrl/meta+wheel behaves like trackpad pinch-zoom.
      let wheelAccPx = 0
      const onCanvasWheel = (e: WheelEvent) => {
        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return

        // Prevent page scroll + Cesium wheel-zoom (we disabled wheel-zoom at the controller too).
        e.preventDefault()
        e.stopPropagation()

        // Trackpad pinch on desktop browsers typically emits ctrl/meta+wheel.
        if (e.ctrlKey || e.metaKey) {
          markInput()
          const ellipsoid = v.scene.globe.ellipsoid
          const scratch = new C.Cartographic()
          C.Cartographic.fromCartesian(v.camera.position, ellipsoid, scratch)
          const asl = Math.max(120, scratch.height)
          // Much more sensitive zoom response (especially at higher ASL).
          const amt = Math.max(80, Math.min(1_500_000, Math.abs(e.deltaY) * (asl * 0.008)))
          try {
            if (e.deltaY > 0) v.camera.zoomOut(amt)
            else v.camera.zoomIn(amt)
          } catch { /* noop */ }
          return
        }

        wheelAccPx += e.deltaY
        // About one viewport height per waypoint step.
        const stepPx = Math.max(260, Math.min(1200, Math.floor(canvas.clientHeight * 0.9)))
        if (Math.abs(wheelAccPx) < stepPx) return
        const dir = wheelAccPx > 0 ? 1 : -1
        wheelAccPx = 0
        markInput()
        navigateWaypointsByScrollRef.current(dir as 1 | -1)
      }
      const onCanvasPointerMove = (e: PointerEvent) => {
        if (e.buttons !== 0) markInput()
      }

      // ── Drag travel (left-drag pans camera position; no angle changes) ───────
      const dragRef = { active: false, x: 0, y: 0, resumeOrbit: false }
      const onCanvasPointerDownTravel = (e: PointerEvent) => {
        // Only left button; ignore right (tilt), ignore modifier drags.
        if (e.button !== 0) return
        if (e.ctrlKey || e.metaKey || e.altKey) return
        dragRef.active = true
        dragRef.x = e.clientX
        dragRef.y = e.clientY
        // Pause orbit while dragging so the camera doesn't “snap back” mid-drag.
        dragRef.resumeOrbit = !!localOrbitRef.current.active
        localOrbitRef.current.active = false
        try { (e.target as Element | null)?.setPointerCapture?.(e.pointerId) } catch { /* noop */ }
      }
      const onCanvasPointerMoveTravel = (e: PointerEvent) => {
        if (!dragRef.active) return
        if ((e.buttons & 1) === 0) { dragRef.active = false; return }
        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return
        // Avoid fighting scripted flights.
        if (isFlyingRef.current || cameraOverviewFlightRef.current || cameraFlightToSite1Ref.current) return

        e.preventDefault()
        e.stopPropagation()

        const dx = e.clientX - dragRef.x
        const dy = e.clientY - dragRef.y
        dragRef.x = e.clientX
        dragRef.y = e.clientY

        // Convert pixels → meters based on current altitude, then apply a *horizontal* ENU shift
        // (east/north) to the camera cartographic position. This keeps altitude stable and avoids
        // unintended “dive below ground” jumps that can happen with `moveUp/moveDown`.
        const ellipsoid = v.scene.globe.ellipsoid
        const scratch = new C.Cartographic()
        C.Cartographic.fromCartesian(v.camera.position, ellipsoid, scratch)
        const asl = Math.max(120, scratch.height)
        const metersPerPx = Math.max(0.6, Math.min(2400, asl * 0.0032))

        const eastM = -dx * metersPerPx
        const northM = dy * metersPerPx
        const lat = scratch.latitude
        const cosLat = Math.max(1e-6, Math.cos(lat))
        const R = ellipsoid.maximumRadius
        const dLon = eastM / (R * cosLat)
        const dLat = northM / R

        const lon2 = scratch.longitude + dLon
        const lat2 = scratch.latitude + dLat
        const h2 = Math.max(80, scratch.height) // hard floor above ellipsoid
        try {
          v.camera.position = C.Cartesian3.fromRadians(lon2, lat2, h2, ellipsoid)
        } catch { /* noop */ }
      }
      const onCanvasPointerUpTravel = (e: PointerEvent) => {
        if (e.button !== 0) return
        dragRef.active = false
        // If we were in orbit mode before the drag, resume orbit but re-anchor to the new view.
        if (dragRef.resumeOrbit) {
          const v = viewerRef.current
          const C = window.Cesium
          if (v && !v.isDestroyed() && C) {
            const w = v.scene.canvas.clientWidth
            const h = v.scene.canvas.clientHeight
            const ellipsoid = v.scene.globe.ellipsoid
            const centerPx = new C.Cartesian2(w * 0.5, h * 0.5)
            let surfacePoint = v.camera.pickEllipsoid(centerPx, ellipsoid)
            if (!C.defined(surfacePoint)) {
              const scratch = new C.Cartographic()
              C.Cartographic.fromCartesian(v.camera.position, ellipsoid, scratch)
              surfacePoint = C.Cartesian3.fromRadians(scratch.longitude, scratch.latitude, 0, ellipsoid)
            }
            const range = Math.max(60, Math.min(50_000_000, C.Cartesian3.distance(v.camera.position, surfacePoint)))
            localOrbitRef.current.active = true
            localOrbitRef.current.target = surfacePoint
            localOrbitRef.current.range = range
            localOrbitRef.current.heading = v.camera.heading
            localOrbitRef.current.pitch = v.camera.pitch
            localOrbitRef.current.roll = v.camera.roll
            lastUserInputMsRef.current = performance.now()
          }
        }
        dragRef.resumeOrbit = false
        try { (e.target as Element | null)?.releasePointerCapture?.(e.pointerId) } catch { /* noop */ }
      }

      // ── Hover: Cabo Negro Site 1 marker hotspot updates bottom-right panel ─
      let lastHoverMs = 0
      const hoverScratch = new Cesium.Cartographic()
      const hoverPx = new Cesium.Cartesian2()
      const hoverPickScratch = new Cesium.Cartesian3()

      const normLonDeltaDeg = (a: number, b: number): number => {
        let d = a - b
        while (d > 180) d -= 360
        while (d < -180) d += 360
        return d
      }

      const updateHoverFromPointer = (e: PointerEvent) => {
        const now = performance.now()
        if (now - lastHoverMs < 80) return
        lastHoverMs = now
        if (e.buttons !== 0) return // dragging
        // Site 1: blue marker coordinate (matches `addSiteMarkers`).
        const SITE1 = { lon: -70.851937, lat: -52.927339 }

        const v = viewerRef.current
        const C = window.Cesium
        if (!v || v.isDestroyed() || !C) return

        const bounds = canvas.getBoundingClientRect()
        C.Cartesian2.fromElements(e.clientX - bounds.left, e.clientY - bounds.top, hoverPx)
        const picked = v.camera.pickEllipsoid(hoverPx, v.scene.globe.ellipsoid, hoverPickScratch)
        if (!picked) {
          if (hoveredWaypoint !== null) setHoveredWaypoint(null)
          return
        }
        C.Cartographic.fromCartesian(picked, v.scene.globe.ellipsoid, hoverScratch)
        const lonDeg = C.Math.toDegrees(hoverScratch.longitude)
        const latDeg = C.Math.toDegrees(hoverScratch.latitude)

        // Small hot zone around the marker (degrees). Tuned for overview usability.
        const dLon = Math.abs(normLonDeltaDeg(lonDeg, SITE1.lon))
        const dLat = Math.abs(latDeg - SITE1.lat)
        const inside = dLon <= 0.018 && dLat <= 0.014

        if (inside) {
          // Show "Cabo Negro — Site 1" content in InfoPanel. If you later add a dedicated
          // waypoint for site1, we can point hoveredWaypoint to that instead.
          const wpSite1 = WAYPOINTS.find(wp => wp.id === 'overview') ?? OVERVIEW_WAYPOINT
          if (hoveredWaypoint?.id !== wpSite1?.id) setHoveredWaypoint(wpSite1 ?? null)
        } else {
          if (hoveredWaypoint !== null) setHoveredWaypoint(null)
        }
      }

      // Prevent accidental zoom on drag: use pointerup "click-like" gesture instead of `click`.
      const onCanvasPointerDownZoomGate = (e: PointerEvent) => {
        canvasPointerDownRef.current = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button }
      }
      const onCanvasPointerUpZoomGate = (e: PointerEvent) => {
        const down = canvasPointerDownRef.current
        canvasPointerDownRef.current = null
        if (!down) return
        // Only treat as zoom click if it wasn't a drag gesture.
        if (!isClickLikeGesture({ x: down.x, y: down.y, t: down.t }, e.clientX, e.clientY)) return
        // Left click → zoom in; right click → zoom out (auxclick is not reliable across browsers).
        if (down.button === 0) onCanvasClick(e as unknown as MouseEvent)
        if (down.button === 2) onAuxClickZoom(e as unknown as MouseEvent)
      }

      canvas.addEventListener('pointerdown', onCanvasPointerDownZoomGate, true)
      canvas.addEventListener('pointerup', onCanvasPointerUpZoomGate, true)
      canvas.addEventListener('click', (e) => { e.preventDefault() }, true)
      // `auxclick` is inconsistent for right-click; pointerup gate handles it.
      canvas.addEventListener('contextmenu', onContextMenu)
      canvas.addEventListener('pointerdown', onCanvasPointerDownTravel, true)
      canvas.addEventListener('pointerdown', onCanvasPointerDown)
      canvas.addEventListener('wheel', onCanvasWheel, { passive: false })
      canvas.addEventListener('pointermove', onCanvasPointerMoveTravel, true)
      canvas.addEventListener('pointermove', onCanvasPointerMove)
      canvas.addEventListener('pointermove', updateHoverFromPointer)
      canvas.addEventListener('pointerup', onCanvasPointerUpTravel, true)

      // Hardening: keep canvas sized; WebGL errors you posted match a 0×0 default framebuffer.
      const ro = new ResizeObserver(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
      })
      ro.observe(containerRef.current)

      const resizeKick = window.setInterval(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        const w = v.scene.canvas.clientWidth
        const h = v.scene.canvas.clientHeight
        if (w < 2 || h < 2) v.resize()
      }, 1200)

      const onLost = (ev: Event) => {
        ev.preventDefault?.()
        dbg('webgl:context-lost')
      }
      const onRestored = () => {
        dbg('webgl:context-restored')
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
      }
      canvas.addEventListener('webglcontextlost', onLost as EventListener, false)
      canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false)

      // Cesium render errors (shader compile, framebuffer issues, etc.)
      const renderErr = (viewer.scene as unknown as { renderError?: { addEventListener?: (fn: (e: unknown) => void) => void; removeEventListener?: (fn: (e: unknown) => void) => void } }).renderError
      const onRenderErr = (e: unknown) => {
        // eslint-disable-next-line no-console
        console.error('[CesiumExplorer] scene.renderError', e)
      }
      renderErr?.addEventListener?.(onRenderErr)

      viewerInteractionsCleanupRef.current = () => {
        canvas.removeEventListener('pointerdown', onCanvasPointerDownZoomGate, true)
        canvas.removeEventListener('pointerup', onCanvasPointerUpZoomGate, true)
        canvas.removeEventListener('contextmenu', onContextMenu)
        canvas.removeEventListener('pointerdown', onCanvasPointerDownTravel, true)
        canvas.removeEventListener('pointerdown', onCanvasPointerDown)
        canvas.removeEventListener('wheel', onCanvasWheel as unknown as EventListener)
        canvas.removeEventListener('pointermove', onCanvasPointerMoveTravel, true)
        canvas.removeEventListener('pointermove', onCanvasPointerMove)
        canvas.removeEventListener('pointermove', updateHoverFromPointer)
        canvas.removeEventListener('pointerup', onCanvasPointerUpTravel, true)
        canvas.removeEventListener('webglcontextlost', onLost as EventListener, false)
        canvas.removeEventListener('webglcontextrestored', onRestored as EventListener, false)
        renderErr?.removeEventListener?.(onRenderErr)
        window.clearInterval(resizeKick)
        ro.disconnect()
      }
      dbg('init:interactions-wired')
      if (cancelled || initSeqRef.current !== mySeq) return

      pointerButtonsRef.current = 0
      isFlyingRef.current = false
      setIsFlying(false)
      cameraFlightToSite1Ref.current = false
      cameraOverviewFlightRef.current = false
      site1OrbitActiveRef.current = false

      setIsLoaded(true)
      // Always increment so dependent UI (time-of-day, etc.) rebinds to the new Viewer when Strict Mode remounts.
      setViewerNonce(n => n + 1)
      dbg('init:ready')
    }

    const safetyTimer = setTimeout(() => {
      if (!viewerRef.current) {
        console.warn('[CesiumExplorer] Init still pending after 8s (network or Ion may be slow).')
      }
    }, 8000)
    initCesium().catch((err) => {
      console.error('[CesiumExplorer] Init failed:', err)
      if (!cancelled && initSeqRef.current === mySeq) {
        setBootError('Unable to load the 3D globe. Check the console or your connection, then refresh.')
      }
    })

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      cancelWaypointAnimRef.current?.()
      cancelWaypointAnimRef.current = null
      cameraFlightToSite1Ref.current = false
      cameraOverviewFlightRef.current = false
      site1OrbitActiveRef.current = false
      isFlyingRef.current = false
      setIsFlying(false)
      viewerInteractionsCleanupRef.current?.()
      viewerInteractionsCleanupRef.current = null
      postUpdateRemoveRef.current?.()
      postUpdateRemoveRef.current = null
      if (viewer && !viewer.isDestroyed()) {
        try { viewer.camera.cancelFlight() } catch { /* noop */ }
        viewer.destroy()
      }
      viewerRef.current        = null
      delete window.Cesium
    }
  }, [setImageryLabel])

  // ── i18n ────────────────────────────────────────────────────────────────────
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
        pointerButtonsRef.current = e.buttons
        // Hover movement should not pause drift; only consider it "input" when a button is down (drag).
        if (e.buttons !== 0) lastUserInputMsRef.current = performance.now()
        setPointerClient({ x: e.clientX, y: e.clientY, active: true })
        bumpMenuFromActivity()
      }}
      onPointerDown={(e) => {
        pointerButtonsRef.current = e.buttons
        lastUserInputMsRef.current = performance.now()
      }}
      onPointerUp={(e) => {
        pointerButtonsRef.current = e.buttons
      }}
      onPointerLeave={() => {
        setPointerClient(p => ({ ...p, active: false }))
      }}
    >
      {!isLoaded && (
        <ExploreLoadingSurface
          subtitle={bootError ?? 'Loading satellite terrain…'}
          suspended
        />
      )}

      {/* Cesium canvas */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Vintage overlay — scanlines, vignette, grain, phosphor tint (z-5, below HUD z-10) */}
      {isLoaded && <VintageOverlay />}

      {isLoaded && globeRenderHint !== 'idle' && (
        <div
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-8"
          aria-live="polite"
          aria-busy
        >
          <p
            className="max-w-md text-center text-sm font-medium tracking-wide text-white md:text-base"
            style={{
              textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 1px rgba(0,0,0,0.9)',
            }}
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
          <ExploreHud
            cardinal={hud.cardinal}
            headingDeg={hud.headingDeg}
            imageryLabel={imageryLabel}
            subsatLonDeg={hud.subsatLonDeg}
            subsatLatDeg={hud.subsatLatDeg}
            sceneNarrative={sceneCaption ?? undefined}
          />
          <CursorCrosshair
            clientX={pointerClient.x}
            clientY={pointerClient.y}
            visible={pointerClient.active}
          />
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
          <ExplorerControls
            waypoints={WAYPOINTS}
            activeWaypoint={activeWaypoint}
            isFlying={isFlying}
            locale={locale}
            onSelectWaypoint={flyToWaypoint}
            onNavigateWaypoints={navigateWaypointsByScroll}
            menuOpacity={menuOpacity}
          />
          <InfoPanel
            waypoint={hoveredWaypoint ?? (selectedParcelSale ? null : activeWaypoint)}
            parcelSale={hoveredWaypoint ? null : selectedParcelSale}
            locale={locale}
            closable={!hoveredWaypoint}
            onClose={() => {
              setSelectedParcelSale(null)
              setActiveWaypoint(null)
            }}
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
