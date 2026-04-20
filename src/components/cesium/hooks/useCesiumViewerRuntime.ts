'use client'

import { useRef, useState, useEffect, useCallback, type MutableRefObject, type RefObject } from 'react'
import type { Viewer as CesiumViewer } from 'cesium'
import { CESIUM_ION_TOKEN, TERRAIN_EXAGGERATION } from '@/lib/cesium/config'
import { WAYPOINTS } from '@/lib/cesium/waypoints'
import type { Waypoint } from '@/lib/cesium/waypoints'
import {
  applyKmlLayerTargetForWaypoint,
  createInitialKmlLayerAlphas,
  type KmlLayerAlphas,
} from '@/lib/cesium/kmlLayers'
import {
  applySociedadesKmlStyling,
  applySubdivisionParcelTerrainWalls,
} from '@/lib/cesium/kmlSociedadesWalls'
import {
  formatSubdivisionGlobeLabel,
  getSubdivisionCatalogEntry,
  KML_NAME_JP_CONTINUADORA,
  KML_NAME_JP_DOS,
  KML_NAME_JP_TRES,
  KML_NAME_PPG_POLYGON,
  PATAGON_VALLEY_33HA_KML_KEYS,
  PATAGON_VALLEY_33HA_KML_KEY_SET,
  PATAGON_VALLEY_PARTITION_TOTAL_HA,
  PPG_PIER_LABEL,
} from '@/lib/cesium/subdivisionParcelCatalog'
import { applyExplorerCameraInteractionScheme } from '@/lib/cesium/cameraUtils'
import {
  entityKmlRawName,
  centroidLonLatFromPositions,
  polygonAreaSqmFromHierarchy,
} from '@/lib/cesium/entityUtils'
import type { ParcelSalePick } from '@/components/cesium/InfoPanel'
import type { FlyPose } from '@/lib/cesium/cameraUtils'
import {
  createPostUpdateHandler,
  type HudState,
} from '@/components/cesium/runtime/createPostUpdateHandler'
import { wireCanvasInteractions } from '@/components/cesium/runtime/wireCanvasInteractions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

declare global {
  interface Window {
    Cesium?: CesiumModule
    CESIUM_BASE_URL?: string
  }
}

export type { HudState }

// ─── KMZ URL constants ─────────────────────────────────────────────────────────
const SUBDIVISION_KMZ_URL = '/cesium/subdivision-vigente.kmz'
const SOCIEDADES_CN_KMZ_URL = '/cesium/sociedades-cn.kmz'
const SOCIEDADES_CN1_KMZ_URL = '/cesium/sociedades-cn-1.kmz'
const SOCIEDADES_WALL_HEIGHT_M = 20
const SUBDIVISION_PARCEL_WALL_HEIGHT_M = 60

// ─── Scene health constants ────────────────────────────────────────────────────
const SCENE_BUSY_GAP_MS = 900
const SCENE_STALL_GAP_MS = 2800

const PUNTA_ARENAS_START_POSE: FlyPose = {
  longitude: -70.921316, latitude: -53.214332, height: 1252,
  heading: 6.103893, pitch: -0.232141, roll: 0,
}

const OVERVIEW_WAYPOINT = WAYPOINTS[0]

type CameraKeyframe = { t: number; longitude: number; latitude: number; height: number; heading: number; pitch: number; roll: number; caption?: string }

type OrbitMathModule = {
  getCaboNegroSite1Pose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => FlyPose
  getDefaultExplorePose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => FlyPose
  getOverviewCameraPose: (index: number) => FlyPose
  getOverviewFlightDurationSec: (fromStage: number, toStage: number) => number
  getSceneKeyframesForWaypoint: (wp: Waypoint) => CameraKeyframe[]
  sampleCameraSceneAt: (kf: CameraKeyframe[], elapsed: number) => { keyframe: CameraKeyframe; caption: string | undefined }
}

// ─── Shared motion refs interface ──────────────────────────────────────────────

export interface CesiumRuntimeSharedRefs {
  isFlyingRef: MutableRefObject<boolean>
  cancelWaypointAnimRef: MutableRefObject<(() => void) | null>
  cameraFlightToSite1Ref: MutableRefObject<boolean>
  site1OrbitActiveRef: MutableRefObject<boolean>
  flyToCaboSite1Ref: MutableRefObject<(() => void) | null>
  navigateWaypointsByScrollRef: MutableRefObject<(dir: 1 | -1) => void>
  commitExploreCaptionRef: MutableRefObject<(raw: string | null) => void>
  pointerButtonsRef: MutableRefObject<number>
  lastUserInputMsRef: MutableRefObject<number>
  exploreMenuSelectionIdRef: MutableRefObject<string>
  /** When true, left-drag translates the camera (ScreenSpaceCameraController). */
  translateEnabledRef: MutableRefObject<boolean>
  primaryMouseButtonDownRef: MutableRefObject<boolean>
}

interface UseCesiumViewerRuntimeOptions {
  containerRef: RefObject<HTMLDivElement | null>
  shared: CesiumRuntimeSharedRefs
  setIsFlying: (v: boolean) => void
  setSelectedParcelSale: React.Dispatch<React.SetStateAction<ParcelSalePick | null>>
}

export interface CesiumViewerRuntimeReturn {
  isLoaded: boolean
  bootError: string | null
  viewerNonce: number
  imageryLabel: string
  altitudeAsl: number | null
  altitudeAgl: number | null
  hud: HudState
  globeRenderHint: 'idle' | 'heavy' | 'stalled'
  viewerRef: MutableRefObject<CesiumViewer | null>
  orbitMathRef: MutableRefObject<OrbitMathModule | null>
  kmlLayerAlphaRef: MutableRefObject<KmlLayerAlphas>
  subdivisionParcelEntitiesRef: MutableRefObject<Set<unknown>>
  patagonValleyHaByKmlNameRef: MutableRefObject<Record<string, number>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedParcelEntityRef: MutableRefObject<any>
  lastSceneHeartbeatAtMsRef: MutableRefObject<number | null>
  /** Imperatively apply a time-of-day hour + day offset to the Cesium viewer. */
  setViewerTimeOfDay: (hour: number, dayOffset: number) => void
}

function shouldDebugCesium(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const qs = new URLSearchParams(window.location.search)
    return qs.has('debugCesium') || qs.has('debug')
  } catch { return false }
}

function shouldDebugCesiumInput(): boolean {
  try {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('debugCesiumInput')
  } catch { return false }
}

function dbg(...args: unknown[]): void {
  if (!shouldDebugCesium() && !shouldDebugCesiumInput()) return
  // eslint-disable-next-line no-console
  console.log('[CesiumExplorer]', ...args)
}

function shouldLogCameraPose(): boolean {
  try {
    if (typeof window === 'undefined') return false
    const qs = new URLSearchParams(window.location.search)
    return qs.has('logCamera') || qs.has('logPose') || shouldDebugCesium()
  } catch { return false }
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

function isChunkLoadError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? `${err.name ?? ''} ${err.message ?? ''}`
      : String(err ?? '')
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk/i.test(msg) ||
    /failed\./i.test(msg) && /chunk/i.test(msg) ||
    /missing:\s*https?:\/\//i.test(msg)
  )
}

function attemptChunkRecoveryReload(): void {
  try {
    const key = 'explore-chunk-reload'
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    window.location.reload()
  } catch {
    // If sessionStorage is blocked, fallback to a plain reload once.
    try { window.location.reload() } catch { /* noop */ }
  }
}

function addBoatAnimation(viewer: CesiumViewer, Cesium: CesiumModule) {
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const stopTime = Cesium.JulianDate.addSeconds(startTime, 300, new Cesium.JulianDate())
  const position = new Cesium.SampledPositionProperty()
  const routePoints = [
    { lon: -70.32, lat: -52.84, t: 0 }, { lon: -70.28, lat: -52.83, t: 60 },
    { lon: -70.24, lat: -52.84, t: 120 }, { lon: -70.20, lat: -52.85, t: 180 },
    { lon: -70.16, lat: -52.85, t: 240 }, { lon: -70.12, lat: -52.84, t: 300 },
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
      pixelSize: 10, color: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#4fc3f7'), outlineWidth: 2,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    },
    label: {
      text: '⛴', font: '18px sans-serif',
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      pixelOffset: new Cesium.Cartesian2(0, -28),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
  viewer.clock.startTime = startTime
  viewer.clock.stopTime = stopTime
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
  viewer.clock.multiplier = 1
  viewer.clock.shouldAnimate = true
}

export function useCesiumViewerRuntime({
  containerRef,
  shared,
  setIsFlying,
  setSelectedParcelSale,
}: UseCesiumViewerRuntimeOptions): CesiumViewerRuntimeReturn {

  const [isLoaded, setIsLoaded] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [viewerNonce, setViewerNonce] = useState(0)
  const [imageryLabel, setImageryLabel] = useState('—')
  const [altitudeAsl, setAltitudeAsl] = useState<number | null>(null)
  const [altitudeAgl, setAltitudeAgl] = useState<number | null>(null)
  const [hud, setHud] = useState<HudState>({ cardinal: 'N', headingDeg: 0, subsatLonDeg: 0, subsatLatDeg: 0 })
  const [globeRenderHint, setGlobeRenderHint] = useState<'idle' | 'heavy' | 'stalled'>('idle')

  const viewerRef = useRef<CesiumViewer | null>(null)
  const orbitMathRef = useRef<OrbitMathModule | null>(null)
  const kmlLayerAlphaRef = useRef<KmlLayerAlphas>(createInitialKmlLayerAlphas())
  const subdivisionParcelEntitiesRef = useRef<Set<unknown>>(new Set())
  const patagonValleyHaByKmlNameRef = useRef<Record<string, number>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedParcelEntityRef = useRef<any>(null)
  const nightTintStageRef = useRef<unknown>(null)
  const postUpdateRemoveRef = useRef<(() => void) | null>(null)
  const viewerInteractionsCleanupRef = useRef<(() => void) | null>(null)
  const initSeqRef = useRef(0)
  const groundHeightRef = useRef(0)

  // HUD throttle refs
  const lastHudCommitMsRef = useRef(0)
  const lastAslCommittedRef = useRef<number | null>(null)
  const lastAglCommittedRef = useRef<number | null>(null)
  const lastHudCommittedRef = useRef<HudState | null>({ cardinal: 'N', headingDeg: 0, subsatLonDeg: 0, subsatLatDeg: 0 })

  const lastSceneHeartbeatAtMsRef = useRef<number | null>(null)

  // Debug / telemetry refs (consumed by the postUpdate handler via refs)
  const postUpdateTickRef = useRef(0)
  const lastOrbitHeadingRef = useRef<number | null>(null)
  const lastDebugMsRef = useRef(0)
  const lastPoseLogMsRef = useRef(0)
  const lastPoseLoggedRef = useRef('')

  // Globe render hint poll
  useEffect(() => {
    if (!isLoaded) { setGlobeRenderHint('idle'); return }
    const poll = () => {
      if (document.visibilityState !== 'visible') { setGlobeRenderHint('idle'); return }
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

  // ── Main viewer init ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const mySeq = ++initSeqRef.current
    let cancelled = false

    const {
      isFlyingRef, cancelWaypointAnimRef, cameraFlightToSite1Ref,
      site1OrbitActiveRef,
      navigateWaypointsByScrollRef, exploreMenuSelectionIdRef,
      pointerButtonsRef, lastUserInputMsRef,
      translateEnabledRef, primaryMouseButtonDownRef,
    } = shared
    // Capture for createPostUpdateHandler closure (refs are stable across renders)
    const orbitLastUserInputMsRef = lastUserInputMsRef
    const orbitIsFlyingRef = isFlyingRef
    const orbitPrimaryMouseButtonDownRef = primaryMouseButtonDownRef
    const orbitPointerButtonsRef = pointerButtonsRef

    const initCesium = async () => {
      setBootError(null)
      dbg('init:start', { seq: mySeq })

      const getAssetPrefix = (): string => {
        try {
          const p = (window.__NEXT_DATA__?.assetPrefix ?? '') as unknown
          return typeof p === 'string' ? p : ''
        } catch { return '' }
      }

      const joinUrl = (prefix: string, path: string): string => {
        const a = (prefix ?? '').replace(/\/+$/, '')
        const b = path.startsWith('/') ? path : `/${path}`
        return `${a}${b}`
      }

      const ensureCesiumScript = async (): Promise<void> => {
        // If the layout <Script> failed to load (assetPrefix/basePath/CDN),
        // inject the Cesium.js script manually using Next's runtime assetPrefix.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Cesium) return
        const existing = document.getElementById('cesium-js') as HTMLScriptElement | null
        if (existing) return

        const srcCandidates = [
          joinUrl(getAssetPrefix(), '/_next/static/cesium/Cesium.js'),
          '/_next/static/cesium/Cesium.js',
        ]
        const chosen = srcCandidates.find(Boolean) ?? '/_next/static/cesium/Cesium.js'

        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.id = 'cesium-js'
          s.async = true
          s.src = chosen
          s.onload = () => resolve()
          s.onerror = () => reject(new Error(`Failed to load Cesium.js at ${chosen}`))
          document.head.appendChild(s)
        })
      }

      // cesium is a webpack external — the library is loaded via a <Script>
      // tag in the explore layout (/_next/static/cesium/Cesium.js).
      // strategy="afterInteractive" means it arrives shortly after hydration,
      // so we poll until window.Cesium is defined rather than assuming it's
      // already there.  30 s timeout surfaces a clear error if the file fails.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Cesium: any = await new Promise<unknown>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Cesium) { resolve((window as any).Cesium); return }
        const deadline = Date.now() + 30_000
        let injected = false
        const id = setInterval(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).Cesium) {
            clearInterval(id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resolve((window as any).Cesium)
          } else if (Date.now() > deadline) {
            clearInterval(id)
            reject(new Error(
              'Cesium.js did not load within 30 s. ' +
              'Check that /_next/static/cesium/Cesium.js is reachable.'
            ))
          } else if (!injected && Date.now() + 5000 > deadline) {
            // Last-chance fallback: try injecting the script ourselves (prod pathing issues).
            injected = true
            ensureCesiumScript().catch(() => undefined)
          }
        }, 50)
      })
      if (cancelled || initSeqRef.current !== mySeq) return

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

      // Ensure Cesium's internal buildModuleUrl points to the right place
      // even when Next is served with an assetPrefix/CDN.
      const assetPrefix = getAssetPrefix()
      window.CESIUM_BASE_URL = joinUrl(assetPrefix || window.location.origin, '/_next/static/cesium/')
      if (!CESIUM_ION_TOKEN) {
        console.warn(
          '[CesiumExplorer] NEXT_PUBLIC_CESIUM_ION_TOKEN is not set. ' +
          'Ion imagery and terrain will fail. Set this env var in your deployment environment.'
        )
      }
      Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

      if (!containerRef.current) return
      if (cancelled || initSeqRef.current !== mySeq) return

      const isMobile = window.innerWidth < 768

      // Primary: Cesium Ion Bing; fallback: ArcGIS; final: Natural Earth
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
        } catch {
          const tmsProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'), { fileExtension: 'jpg' },
          )
          baseLayer = new Cesium.ImageryLayer(tmsProvider)
          setImageryLabel('NATURAL EARTH II')
        }
      }

      let terrainProvider: InstanceType<typeof Cesium.TerrainProvider>
      try {
        terrainProvider = await Cesium.createWorldTerrainAsync({ requestWaterMask: true, requestVertexNormals: false })
      } catch (err) {
        console.warn('[CesiumExplorer] World terrain unavailable.', err)
        terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }
      if (cancelled || initSeqRef.current !== mySeq) return

      const createdViewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider, baseLayer: false,
        baseLayerPicker: false, geocoder: false, homeButton: false,
        sceneModePicker: false, navigationHelpButton: false,
        animation: false, timeline: false, fullscreenButton: false,
        infoBox: false, selectionIndicator: false,
        creditContainer: document.createElement('div'),
        msaaSamples: isMobile ? 1 : 4,
      })
      createdViewer.imageryLayers.add(baseLayer)
      dbg('init:viewer-created', { isMobile })
      if (cancelled || initSeqRef.current !== mySeq) {
        try { createdViewer.destroy() } catch { /* noop */ }
        return
      }

      // Alias used by legacy init code below.
      // (Keeps changes small while ensuring viewer is non-null by construction.)
      const viewer = createdViewer

      const osmViewer = createdViewer
      setTimeout(async () => {
        if (cancelled || initSeqRef.current !== mySeq) return
        if (!osmViewer || osmViewer.isDestroyed()) return
        try { osmViewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync()) } catch { /* optional */ }
      }, 3000)

      viewerRef.current = createdViewer
      window.Cesium = Cesium
      if (cancelled || initSeqRef.current !== mySeq) return

      applyExplorerCameraInteractionScheme(Cesium, createdViewer, {
        includePinchInRotateTilt: isMobile,
      })

      // Let the browser send uninterrupted pointer drags to the WebGL canvas (maps / globes).
      try {
        const canvas = createdViewer.scene.canvas as HTMLCanvasElement
        canvas.style.touchAction = 'none'
        canvas.style.userSelect = 'none'
      } catch {
        /* noop */
      }

      createdViewer.scene.verticalExaggeration = isMobile ? 1.5 : TERRAIN_EXAGGERATION
      createdViewer.scene.globe.enableLighting = true
      createdViewer.scene.globe.dynamicAtmosphereLighting = false
      createdViewer.scene.globe.atmosphereLightIntensity = 12.0
      createdViewer.scene.globe.atmosphereRayleighCoefficient = new Cesium.Cartesian3(5.5e-6, 13.0e-6, 28.4e-6)

      // Reduce main-thread work when the scene is static (helps cut Chrome's
      // "[Violation] requestAnimationFrame handler took …ms" spam).
      try {
        createdViewer.scene.requestRenderMode = true
        createdViewer.scene.maximumRenderTimeChange = 1 / 30
        createdViewer.scene.requestRender()
      } catch {
        /* optional */
      }

      const initDate = new Date()
      initDate.setUTCHours(17, 0, 0, 0)
      createdViewer.clock.currentTime = Cesium.JulianDate.fromDate(initDate)

      createdViewer.scene.atmosphere.brightnessShift = 0.45
      createdViewer.scene.atmosphere.saturationShift = 0.15
      createdViewer.scene.fog.enabled = false
      createdViewer.scene.globe.depthTestAgainstTerrain = true
      createdViewer.scene.backgroundColor = new Cesium.Color(0.0, 0.04, 0.1, 1.0)

      try { createdViewer.scene.globe.showWaterEffect = true; createdViewer.scene.globe.material = undefined } catch { /* optional */ }

      const skyBox = createdViewer.scene.skyBox as { show?: boolean } | undefined
      if (skyBox) skyBox.show = false
      const skyAtmosphere = createdViewer.scene.skyAtmosphere as { show?: boolean } | undefined
      if (skyAtmosphere) skyAtmosphere.show = false
      try { createdViewer.scene.globe.showGroundAtmosphere = false } catch { /* optional */ }

      createdViewer.shadows = !isMobile
      createdViewer.terrainShadows = isMobile ? Cesium.ShadowMode.DISABLED : Cesium.ShadowMode.ENABLED
      createdViewer.scene.postProcessStages.fxaa.enabled = true
      if (!isMobile) {
        createdViewer.scene.postProcessStages.bloom.enabled = true
        createdViewer.scene.postProcessStages.bloom.uniforms.contrast = 80
        createdViewer.scene.postProcessStages.bloom.uniforms.brightness = -0.1
        createdViewer.scene.postProcessStages.bloom.uniforms.glowOnly = false
      }

      try {
        const stage = new Cesium.PostProcessStage({
          name: 'explorerNightTint',
          fragmentShader: `
            uniform sampler2D colorTexture;
            in vec2 v_textureCoordinates;
            uniform float u_nightAmount;
            void main() {
              vec4 c = texture(colorTexture, v_textureCoordinates);
              float a = clamp(u_nightAmount, 0.0, 1.0);
              vec3 dark = c.rgb * mix(1.0, 0.55, a);
              vec3 cool = dark * vec3(0.88, 0.92, 1.05);
              c.rgb = mix(dark, cool, a * 0.55);
              out_FragColor = c;
            }
          `,
          uniforms: { u_nightAmount: 0.0 },
        })
        createdViewer.scene.postProcessStages.add(stage)
        nightTintStageRef.current = stage
      } catch { /* optional */ }

      createdViewer.resolutionScale = isMobile ? 0.70 : 0.88
      createdViewer.scene.globe.maximumScreenSpaceError = isMobile ? 5 : 3
      if (!isMobile) createdViewer.scene.globe.tileCacheSize = 200

      addBoatAnimation(createdViewer, Cesium)
      createdViewer.clock.shouldAnimate = false

      subdivisionParcelEntitiesRef.current = new Set()
      patagonValleyHaByKmlNameRef.current = {}
      kmlLayerAlphaRef.current = createInitialKmlLayerAlphas()
      applyKmlLayerTargetForWaypoint(exploreMenuSelectionIdRef.current, kmlLayerAlphaRef)

      const viewerForKml = createdViewer
      // Pre-compute base colors — shared across CallbackProperty closures
      const fillBase = Cesium.Color.fromCssColorString('#00e5ff')
      const fillSelected = Cesium.Color.fromCssColorString('#ffd54a')
      const lineBase = Cesium.Color.fromCssColorString('#00fff0')

      // ── Subdivision KMZ ───────────────────────────────────────────────────
      ;(async () => {
        try {
          const prevWarn = console.warn
          console.warn = (...args: unknown[]) => {
            const msg = typeof args[0] === 'string' ? args[0] : ''
            if (
              msg.startsWith('KML - Unsupported StyleMap key: highlight') ||
              msg.startsWith('KML - SchemaData is unsupported') ||
              msg.startsWith('KML Tour unsupported node ')
            ) {
              return
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(prevWarn as any)(...args)
          }
          const ds = await Cesium.KmlDataSource.load(
            SUBDIVISION_KMZ_URL,
            { camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas },
          )
          console.warn = prevWarn
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)

          const entitySet = new Set<unknown>()
          let parcelPolyLabelIndex = 0
          const pendingParcelLabels: {
            entity: CesiumModule; lon: number; lat: number; areaSqm: number; rawName: string; idx: number
          }[] = []
          const sqmPartition: Record<string, number> = {}
          for (const key of PATAGON_VALLEY_33HA_KML_KEYS) sqmPartition[key] = 0

          for (const entity of ds.entities.values) {
            entitySet.add(entity)
            if (entity.polygon) {
              entity.polygon.heightReference = new Cesium.ConstantProperty(Cesium.HeightReference.CLAMP_TO_GROUND)
              entity.polygon.perPositionHeight = new Cesium.ConstantProperty(false)
              try {
                const t = viewerForKml.clock.currentTime
                const hierarchy = entity.polygon.hierarchy?.getValue?.(t)
                const positions = hierarchy?.positions as unknown[] | undefined
                const areaSqm = hierarchy ? polygonAreaSqmFromHierarchy(Cesium, hierarchy) : null
                const ll = positions?.length ? centroidLonLatFromPositions(Cesium, positions) : null
                const rawName = entityKmlRawName(viewerForKml, entity)
                if (areaSqm != null && Number.isFinite(areaSqm) && PATAGON_VALLEY_33HA_KML_KEY_SET.has(rawName)) {
                  sqmPartition[rawName] = (sqmPartition[rawName] ?? 0) + areaSqm
                }
                if (ll && areaSqm != null && Number.isFinite(areaSqm) && areaSqm > 1) {
                  pendingParcelLabels.push({ entity, lon: ll.lon, lat: ll.lat, areaSqm, rawName, idx: parcelPolyLabelIndex++ })
                }
              } catch { /* optional */ }

              // Precompute static catalog data once per entity so the per-frame
              // CallbackProperty stays at ref-check + one multiply.
              const cachedRaw = entityKmlRawName(viewerForKml, entity)
              const cachedCat = getSubdivisionCatalogEntry(cachedRaw)
              const cachedBaseFill = (cachedCat
                ? Cesium.Color.fromCssColorString(cachedCat.fillCss)
                : fillBase.clone()) as typeof fillBase
              const cachedNoTint = cachedCat?.showPolygonFill === false
              const fillScratch = cachedBaseFill.clone()
              entity.polygon.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(() => {
                  const sel = selectedParcelEntityRef.current
                  const isSelected =
                    sel === entity ||
                    (sel instanceof Set && (sel as Set<unknown>).has(entity))
                  const base = isSelected ? fillSelected : cachedBaseFill
                  const a = cachedNoTint ? 0 : isSelected ? 0.62 : 0.42
                  return base.withAlpha(a * kmlLayerAlphaRef.current.subdivision, fillScratch)
                }, false),
              )
            }
            if (entity.polyline) {
              const lineScratch = lineBase.clone()
              entity.polyline.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(
                  () => lineBase.withAlpha(0.92 * kmlLayerAlphaRef.current.subdivision, lineScratch), false,
                ),
              )
              entity.polyline.width = new Cesium.ConstantProperty(5)
              entity.polyline.arcType = new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC)
              entity.polyline.clampToGround = new Cesium.ConstantProperty(true)
            }
            if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false)
          }

          let sumPartitionSqm = 0
          for (const key of PATAGON_VALLEY_33HA_KML_KEYS) sumPartitionSqm += sqmPartition[key] ?? 0
          const nextScaledHa: Record<string, number> = {}
          if (sumPartitionSqm > 0) {
            for (const key of PATAGON_VALLEY_33HA_KML_KEYS) {
              const sq = sqmPartition[key] ?? 0
              nextScaledHa[key] = PATAGON_VALLEY_PARTITION_TOTAL_HA * (sq / sumPartitionSqm)
            }
          }
          patagonValleyHaByKmlNameRef.current = nextScaledHa

          if (!viewerForKml.isDestroyed() && !cancelled && initSeqRef.current === mySeq) {
            await applySubdivisionParcelTerrainWalls(
              viewerForKml, Cesium, ds,
              (ent) => {
                const raw = entityKmlRawName(viewerForKml, ent)
                const cat = getSubdivisionCatalogEntry(raw)
                return cat?.wallHeightM ?? SUBDIVISION_PARCEL_WALL_HEIGHT_M
              },
              () => kmlLayerAlphaRef.current.subdivision,
              (e) => {
                const sel = selectedParcelEntityRef.current
                return sel === e || (sel instanceof Set && (sel as Set<unknown>).has(e))
              },
            )
          }

          const toGroundLabels = pendingParcelLabels.filter(p => {
            const cat = getSubdivisionCatalogEntry(p.rawName)
            return !cat?.hideLabel
          })
          if (toGroundLabels.length && !viewerForKml.isDestroyed() && !cancelled && initSeqRef.current === mySeq) {
            const LABEL_LIFT_M = 0.35
            const cartos = toGroundLabels.map(p => {
              const cat = getSubdivisionCatalogEntry(p.rawName)
              const lon = p.lon + (cat?.labelOffsetDeg?.lon ?? 0)
              const lat = p.lat + (cat?.labelOffsetDeg?.lat ?? 0)
              return Cesium.Cartographic.fromDegrees(lon, lat)
            })
            try { await Cesium.sampleTerrainMostDetailed(viewerForKml.terrainProvider, cartos) } catch { /* ok */ }
            for (let i = 0; i < toGroundLabels.length; i++) {
              const p = toGroundLabels[i]!
              const c = cartos[i]!
              const cat = getSubdivisionCatalogEntry(p.rawName)
              const h = Number.isFinite(c.height) ? c.height : 0
              const pos = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, h + LABEL_LIFT_M)
              p.entity.position = new Cesium.ConstantPositionProperty(pos)
              const scaled = patagonValleyHaByKmlNameRef.current[p.rawName]
              const ha = cat?.areaHa != null && Number.isFinite(cat.areaHa) ? cat.areaHa
                : scaled != null && Number.isFinite(scaled) ? scaled
                : p.areaSqm / 10_000
              const labelText = formatSubdivisionGlobeLabel(cat, p.rawName, ha)
              const hasManualPlacement = Boolean(cat?.labelOffsetDeg) || Boolean(cat?.labelPixelOffset)
              const ox = (hasManualPlacement ? 0 : ((p.idx % 5) - 2) * 14) + (cat?.labelPixelOffset?.x ?? 0)
              const oy = (hasManualPlacement ? -8 : -10 - (p.idx % 8) * 10) + (cat?.labelPixelOffset?.y ?? 0)
              p.entity.label = new Cesium.LabelGraphics({
                text: labelText,
                font: '12px "JetBrains Mono","Fira Code",ui-monospace,monospace',
                fillColor: Cesium.Color.fromCssColorString('rgba(255,255,255,0.78)'),
                outlineColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.55)'),
                outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                heightReference: Cesium.HeightReference.NONE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(ox, oy),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 22_000),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString('rgba(6,10,18,0.25)'),
                backgroundPadding: new Cesium.Cartesian2(6, 4),
                scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 22_000, 0.0),
              })
            }
          }

          // Pier label
          if (!viewerForKml.isDestroyed() && !cancelled && initSeqRef.current === mySeq) {
            const LABEL_LIFT_M = 0.35
            const ppgCarto = Cesium.Cartographic.fromDegrees(PPG_PIER_LABEL.lon, PPG_PIER_LABEL.lat)
            try { await Cesium.sampleTerrainMostDetailed(viewerForKml.terrainProvider, [ppgCarto]) } catch { /* noop */ }
            const ph = Number.isFinite(ppgCarto.height) ? ppgCarto.height : 0
            viewerForKml.entities.add({
              id: 'explorer-ppg-pier-label',
              position: Cesium.Cartesian3.fromRadians(ppgCarto.longitude, ppgCarto.latitude, ph + LABEL_LIFT_M),
              label: new Cesium.LabelGraphics({
                text: PPG_PIER_LABEL.text,
                font: '12px "JetBrains Mono","Fira Code",ui-monospace,monospace',
                fillColor: Cesium.Color.fromCssColorString('rgba(255,255,255,0.88)'),
                outlineColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.55)'),
                outlineWidth: 3, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                heightReference: Cesium.HeightReference.NONE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(PPG_PIER_LABEL.labelPixelOffset.x, PPG_PIER_LABEL.labelPixelOffset.y),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 28_000),
                showBackground: true,
                backgroundColor: Cesium.Color.fromCssColorString('rgba(6,10,18,0.35)'),
                backgroundPadding: new Cesium.Cartesian2(6, 4),
                scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 28_000, 0.0),
              }),
            })
          }

          // Add rather than replace so Sociedades CN entities added concurrently are not lost.
          for (const ent of entitySet) subdivisionParcelEntitiesRef.current.add(ent)
          dbg('init:subdivision-kmz', { entities: ds.entities.values.length })
        } catch (err) { warnOnce('subdivision-kmz', 'Subdivision KMZ failed to load.', err) }
      })()

      // ── Sociedades CN KMZ ──────────────────────────────────────────────────
      ;(async () => {
        try {
          const prevWarn = console.warn
          console.warn = (...args: unknown[]) => {
            const msg = typeof args[0] === 'string' ? args[0] : ''
            if (
              msg.startsWith('KML - Unsupported StyleMap key: highlight') ||
              msg.startsWith('KML - SchemaData is unsupported') ||
              msg.startsWith('KML Tour unsupported node ')
            ) {
              return
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(prevWarn as any)(...args)
          }
          const ds = await Cesium.KmlDataSource.load(
            SOCIEDADES_CN_KMZ_URL,
            { camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas },
          )
          console.warn = prevWarn
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)
          ds.show = false
          await applySociedadesKmlStyling(viewerForKml, Cesium, ds, () => kmlLayerAlphaRef.current.sociedadesCn, SOCIEDADES_WALL_HEIGHT_M)

          // ── Make J&P Dos, J&P Tres, and PPG boundary polygons clickable ───
          const wallLine = Cesium.Color.fromCssColorString('#00fff0')
          const wallLineSel = Cesium.Color.fromCssColorString('#fff2b2')
          const wallScratch = wallLine.clone()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clickableJobs: { entity: any; cartos: any[] }[] = []
          const t = viewerForKml.clock.currentTime

          for (const entity of ds.entities.values) {
            if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false)
            if (entity.label) entity.label.show = new Cesium.ConstantProperty(false)
            if (entity.point) entity.point.show = new Cesium.ConstantProperty(false)
            const raw = entityKmlRawName(viewerForKml, entity)
            if (raw === KML_NAME_JP_CONTINUADORA) { entity.show = false; continue }

            const isJP = raw === KML_NAME_JP_DOS || raw === KML_NAME_JP_TRES
            const isPpgPolygon = raw === '' && entity.polygon != null
            if (!isJP && !isPpgPolygon) continue

            // Assign the synthetic PPG name so catalog and narrative lookup work.
            if (isPpgPolygon) entity.name = KML_NAME_PPG_POLYGON
            const resolvedRaw = isPpgPolygon ? KML_NAME_PPG_POLYGON : raw

            // Add to clickable set — subdivision loading uses .add() so no race.
            subdivisionParcelEntitiesRef.current.add(entity)

            // Override polygon material with selection-aware, walls-only fill.
            if (entity.polygon) {
              const cat = getSubdivisionCatalogEntry(resolvedRaw)
              const fillBase = Cesium.Color.fromCssColorString(cat?.fillCss ?? '#0f766e')
              const fillSel = fillBase.brighten(0.5, fillBase.clone())
              const noTint = cat?.showPolygonFill === false
              const fillScratch = fillBase.clone()
              entity.polygon.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(() => {
                  const sel = selectedParcelEntityRef.current
                  const isSel = sel === entity || (sel instanceof Set && (sel as Set<unknown>).has(entity))
                  const a = noTint ? 0 : isSel ? 0.62 : 0.42
                  return (isSel ? fillSel : fillBase).withAlpha(
                    a * kmlLayerAlphaRef.current.sociedadesCn,
                    fillScratch,
                  )
                }, false),
              )
              entity.polygon.outline = new Cesium.ConstantProperty(false)
            }

            // Collect polygon outer ring for terrain-sampled wall.
            if (entity.polygon?.hierarchy) {
              try {
                const hierarchy = entity.polygon.hierarchy.getValue(t)
                const positions = hierarchy?.positions as unknown[] | undefined
                if (positions?.length) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cartos = positions.map((p: any) => Cesium.Cartographic.fromCartesian(p))
                  const a0 = cartos[0]!
                  const aN = cartos[cartos.length - 1]!
                  if (Math.abs(a0.longitude - aN.longitude) > 1e-12 || Math.abs(a0.latitude - aN.latitude) > 1e-12) {
                    cartos.push(Cesium.Cartographic.clone(a0))
                  }
                  clickableJobs.push({ entity, cartos })
                }
              } catch { /* skip */ }
            }
          }

          // Batch terrain sample for wall heights.
          if (clickableJobs.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const flat: any[] = []
            const ranges: { entity: unknown; start: number; len: number }[] = []
            for (const j of clickableJobs) {
              ranges.push({ entity: j.entity, start: flat.length, len: j.cartos.length })
              flat.push(...j.cartos)
            }
            try {
              await Cesium.sampleTerrainMostDetailed(viewerForKml.terrainProvider, flat).catch(() => undefined)
            } catch { /* ellipsoid fallback */ }

            for (const r of ranges) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ent = r.entity as any
                const entRaw = entityKmlRawName(viewerForKml, ent)
                const cat = getSubdivisionCatalogEntry(entRaw)
                const wallM = cat?.wallHeightM ?? SUBDIVISION_PARCEL_WALL_HEIGHT_M
                const cartos = flat.slice(r.start, r.start + r.len)
                const minH = cartos.map((c: { height: number }) => c.height)
                const maxH = minH.map((h: number) => h + wallM)
                const wallPositions = cartos.map((c: { longitude: number; latitude: number; height: number }) =>
                  Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height),
                )
                ent.wall = new Cesium.WallGraphics({
                  positions: new Cesium.ConstantProperty(wallPositions),
                  minimumHeights: new Cesium.ConstantProperty(minH),
                  maximumHeights: new Cesium.ConstantProperty(maxH),
                  material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty(() => {
                      const sel = selectedParcelEntityRef.current
                      const isSel = sel === ent || (sel instanceof Set && (sel as Set<unknown>).has(ent))
                      return (isSel ? wallLineSel : wallLine).withAlpha(
                        0.88 * kmlLayerAlphaRef.current.sociedadesCn,
                        wallScratch,
                      )
                    }, false),
                  ),
                })
              } catch { /* skip */ }
            }
          }
          // ─────────────────────────────────────────────────────────────────

          ds.show = true
          dbg('init:sociedades-cn-kmz', { entities: ds.entities.values.length })
        } catch (err) { warnOnce('sociedades-cn-kmz', 'Sociedades CN KMZ failed to load.', err) }
      })()

      // ── Sociedades CN-1 KMZ ────────────────────────────────────────────────
      ;(async () => {
        try {
          const prevWarn = console.warn
          console.warn = (...args: unknown[]) => {
            const msg = typeof args[0] === 'string' ? args[0] : ''
            if (
              msg.startsWith('KML - Unsupported StyleMap key: highlight') ||
              msg.startsWith('KML - SchemaData is unsupported') ||
              msg.startsWith('KML Tour unsupported node ')
            ) {
              return
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(prevWarn as any)(...args)
          }
          const ds = await Cesium.KmlDataSource.load(
            SOCIEDADES_CN1_KMZ_URL,
            { camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas },
          )
          console.warn = prevWarn
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)
          ds.show = false
          await applySociedadesKmlStyling(viewerForKml, Cesium, ds, () => kmlLayerAlphaRef.current.sociedadesCn1, SOCIEDADES_WALL_HEIGHT_M)
          for (const entity of ds.entities.values) {
            if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false)
            if (entity.label) entity.label.show = new Cesium.ConstantProperty(false)
            if (entity.point) entity.point.show = new Cesium.ConstantProperty(false)
            if (entityKmlRawName(viewerForKml, entity) === KML_NAME_JP_CONTINUADORA) entity.show = false
          }
          ds.show = true
          dbg('init:sociedades-cn1-kmz', { entities: ds.entities.values.length })
        } catch (err) { warnOnce('sociedades-cn1-kmz', 'Sociedades CN-1 KMZ failed to load.', err) }
      })()

      // ── postUpdate: orbit + HUD + terrain sampling ────────────────────────
      const onPostUpdate = createPostUpdateHandler({
        viewerRef,
        translateEnabledRef,
        kmlLayerAlphaRef,
        lastSceneHeartbeatAtMsRef,
        groundHeightRef,
        lastHudCommitMsRef,
        lastAslCommittedRef,
        lastAglCommittedRef,
        lastHudCommittedRef,
        setAltitudeAsl,
        setAltitudeAgl,
        setHud,
        shouldLogCameraPose,
        lastPoseLogMsRef,
        lastPoseLoggedRef,
        lastUserInputMsRef: orbitLastUserInputMsRef,
        isFlyingRef: orbitIsFlyingRef,
        primaryMouseButtonDownRef: orbitPrimaryMouseButtonDownRef,
        pointerButtonsRef: orbitPointerButtonsRef,
        shouldDebugCesium,
        shouldDebugCesiumInput,
        debug: dbg,
        warnOnce,
        postUpdateTickRef,
        lastOrbitHeadingRef,
        lastDebugMsRef,
      })
      viewer.scene.postUpdate.addEventListener(onPostUpdate)
      const viewerForPost = viewer
      postUpdateRemoveRef.current = () => {
        if (viewerForPost && !viewerForPost.isDestroyed()) {
          viewerForPost.scene.postUpdate.removeEventListener(onPostUpdate)
        }
      }
      dbg('init:postUpdate-attached')
      if (cancelled || initSeqRef.current !== mySeq) return

      // ── Initial camera position ────────────────────────────────────────────
      if (OVERVIEW_WAYPOINT) {
        const pose = orbitMathRef.current?.getDefaultExplorePose(OVERVIEW_WAYPOINT)
        if (!pose) throw new Error('[CesiumExplorer] orbitMath not ready (default pose).')
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
          orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
        })
      } else {
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(PUNTA_ARENAS_START_POSE.longitude, PUNTA_ARENAS_START_POSE.latitude, PUNTA_ARENAS_START_POSE.height),
          orientation: { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 },
        })
      }

      requestAnimationFrame(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
        requestAnimationFrame(() => { const v2 = viewerRef.current; if (!v2 || v2.isDestroyed()) return; v2.resize() })
      })
      if (cancelled || initSeqRef.current !== mySeq) return

      // ── Canvas + window interaction bindings ───────────────────────────────
      viewerInteractionsCleanupRef.current?.()
      viewerInteractionsCleanupRef.current = null
      subdivisionParcelEntitiesRef.current = new Set()
      patagonValleyHaByKmlNameRef.current = {}
      selectedParcelEntityRef.current = null
      setSelectedParcelSale(null)

      viewerInteractionsCleanupRef.current = wireCanvasInteractions({
        viewer,
        Cesium,
        container: containerRef.current!,
        kmlLayerAlphaRef,
        subdivisionParcelEntitiesRef,
        selectedParcelEntityRef,
        patagonValleyHaByKmlNameRef,
        lastUserInputMsRef,
        pointerButtonsRef,
        primaryMouseButtonDownRef,
        cancelWaypointAnimRef,
        navigateWaypointsByScrollRef,
        isFlyingRef,
        translateEnabledRef,
        viewerRef,
        setSelectedParcelSale,
        debug: (label, payload) => dbg(label, payload),
      })
      dbg('init:interactions-wired')
      // Re-apply after the current frame — some Cesium wiring completes after first tick.
      requestAnimationFrame(() => {
        const v2 = viewerRef.current
        if (cancelled || initSeqRef.current !== mySeq || !v2 || v2.isDestroyed()) return
        applyExplorerCameraInteractionScheme(Cesium, v2, { includePinchInRotateTilt: isMobile })
        try {
          (v2.scene.canvas as HTMLCanvasElement).style.touchAction = 'none'
        } catch {
          /* noop */
        }
      })
      if (shouldDebugCesiumInput()) {
        // eslint-disable-next-line no-console
        console.info(
          '[CesiumExplorer] Input debug: watch `[CesiumExplorer/input]` and `tick` logs; drag on the globe and confirm `primaryMouseDown` stays true while holding LMB.',
        )
      }
      if (cancelled || initSeqRef.current !== mySeq) return

      pointerButtonsRef.current = 0
      isFlyingRef.current = false
      setIsFlying(false)
      cameraFlightToSite1Ref.current = false
      site1OrbitActiveRef.current = false

      setIsLoaded(true)
      setViewerNonce(n => n + 1)
      dbg('init:ready')
    }

    const safetyTimer = setTimeout(() => {
      if (!viewerRef.current) console.warn('[CesiumExplorer] Init still pending after 8s.')
    }, 8000)

    initCesium().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[CesiumExplorer] Init failed:', err)
      if (isChunkLoadError(err)) {
        // Stale HTML pointing at old chunk hashes (common after redeploy).
        // Reload once so the browser fetches the latest HTML + matching chunks.
        attemptChunkRecoveryReload()
        return
      }
      // Surface the real error message in prod so it appears in Vercel function logs.
      // Ion auth failures show "Unauthorized" or "401"; asset failures show the URL.
      if (!cancelled && initSeqRef.current === mySeq) {
        setBootError(
          `Unable to load the 3D globe. ${msg ? `(${msg}) ` : ''}Check the console or your connection, then refresh.`
        )
      }
    })

    return () => {
      cancelled = true
      clearTimeout(safetyTimer)
      cancelWaypointAnimRef.current?.()
      cancelWaypointAnimRef.current = null
      cameraFlightToSite1Ref.current = false
      site1OrbitActiveRef.current = false
      isFlyingRef.current = false
      setIsFlying(false)
      viewerInteractionsCleanupRef.current?.()
      viewerInteractionsCleanupRef.current = null
      postUpdateRemoveRef.current?.()
      postUpdateRemoveRef.current = null
      const v = viewerRef.current
      if (v && !v.isDestroyed()) {
        try { v.camera.cancelFlight() } catch { /* noop */ }
        v.destroy()
      }
      viewerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setViewerTimeOfDay = useCallback((hour: number, dayOffset: number) => {
    const v = viewerRef.current
    const C: CesiumModule = window.Cesium
    if (!v || v.isDestroyed() || !C) return
    const date = new Date()
    if (Number.isFinite(dayOffset) && dayOffset !== 0) date.setUTCDate(date.getUTCDate() + dayOffset)
    date.setUTCHours((hour + 3) % 24, 0, 0, 0)
    v.clock.currentTime = C.JulianDate.fromDate(date)
    try {
      const scene = v.scene as unknown as {
        colorCorrection?: { enabled?: boolean; brightness?: number; contrast?: number; hue?: number; saturation?: number }
        globe?: { dynamicAtmosphereLighting?: boolean; enableLighting?: boolean }
      }
      const h = ((hour % 24) + 24) % 24
      const night = h < 6 || h >= 20
      const dawnDusk = (h >= 6 && h < 9) || (h >= 17 && h < 20)
      const nightAmount = night ? 1 : dawnDusk ? 0.55 : 0
      if (scene.globe) { scene.globe.enableLighting = true; scene.globe.dynamicAtmosphereLighting = true }
      if (scene.colorCorrection) {
        scene.colorCorrection.enabled = true
        scene.colorCorrection.brightness = night ? 0.74 : dawnDusk ? 0.88 : 1.02
        scene.colorCorrection.contrast = night ? 1.18 : dawnDusk ? 1.12 : 1.06
        scene.colorCorrection.saturation = night ? 0.82 : dawnDusk ? 0.92 : 1.02
        scene.colorCorrection.hue = night ? -0.04 : dawnDusk ? 0.02 : 0
      }
      const st = nightTintStageRef.current as null | { uniforms?: Record<string, unknown> }
      if (st?.uniforms) st.uniforms.u_nightAmount = nightAmount
    } catch { /* optional */ }
  }, [])

  return {
    isLoaded, bootError, viewerNonce, imageryLabel,
    altitudeAsl, altitudeAgl, hud, globeRenderHint,
    viewerRef, orbitMathRef, kmlLayerAlphaRef,
    subdivisionParcelEntitiesRef, patagonValleyHaByKmlNameRef,
    selectedParcelEntityRef, lastSceneHeartbeatAtMsRef,
    setViewerTimeOfDay,
  }
}
