'use client'

import { useRef, useState, useEffect, useCallback, type MutableRefObject, type RefObject } from 'react'
import type { Viewer as CesiumViewer } from 'cesium'
import { CESIUM_ION_TOKEN, TERRAIN_EXAGGERATION } from '@/lib/cesium/config'
import { WAYPOINTS } from '@/lib/cesium/waypoints'
import type { Waypoint } from '@/lib/cesium/waypoints'
import {
  applyKmlLayerTargetForWaypoint,
  createInitialKmlLayerAlphas,
  stepKmlLayerAlphas,
  type KmlLayerAlphas,
} from '@/lib/cesium/kmlLayers'
import {
  applySociedadesKmlStyling,
  applySubdivisionParcelTerrainWalls,
} from '@/lib/cesium/kmlSociedadesWalls'
import {
  formatSubdivisionGlobeLabel,
  getSubdivisionCatalogEntry,
  KML_NAME_JP_24HA,
  KML_NAME_JP_CONTINUADORA,
  PATAGON_VALLEY_33HA_KML_KEYS,
  PATAGON_VALLEY_33HA_KML_KEY_SET,
  PATAGON_VALLEY_PARTITION_TOTAL_HA,
  PPG_PIER_LABEL,
} from '@/lib/cesium/subdivisionParcelCatalog'
import {
  applyExplorerCameraInteractionScheme,
  syncOrbitOffsetEnuFromCamera,
  applyOrbitCameraFromEnuOffset,
  rotateOrbitOffsetEnuAroundUp,
  cardinal8,
  formatAlt,
  isClickLikeGesture,
} from '@/lib/cesium/cameraUtils'
import {
  entityKmlRawName,
  centroidLonLatFromEntity,
  centroidLonLatFromPositions,
  polygonAreaSqmFromHierarchy,
  findParcelEntityUnderCursor,
  parcelAreaHaFromPolygonEntity,
  entityDisplayName,
} from '@/lib/cesium/entityUtils'
import type { ParcelSalePick } from '@/components/cesium/InfoPanel'
import type { FlyPose } from '@/lib/cesium/cameraUtils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

declare global {
  interface Window {
    Cesium?: CesiumModule
    CESIUM_BASE_URL?: string
  }
}

// ─── KMZ URL constants ─────────────────────────────────────────────────────────
const SUBDIVISION_KMZ_URL = '/cesium/subdivision-vigente.kmz'
const SOCIEDADES_CN_KMZ_URL = '/cesium/sociedades-cn.kmz'
const SOCIEDADES_CN1_KMZ_URL = '/cesium/sociedades-cn-1.kmz'
const SOCIEDADES_WALL_HEIGHT_M = 20
const SUBDIVISION_PARCEL_WALL_HEIGHT_M = 60

// ─── Scene health constants ────────────────────────────────────────────────────
const SCENE_BUSY_GAP_MS = 900
const SCENE_STALL_GAP_MS = 2800
const TERRAIN_UNDER_CAMERA_MS = 400
const DRIFT_IDLE_AFTER_INPUT_MS = 900
const ORBIT_MIN_STEP_RAD = 1e-12

// ─── Orbit speed constants ─────────────────────────────────────────────────────
const LOCAL_ORBIT_RAD_PER_SEC_AT_1KM = 0.035
const LOCAL_ORBIT_RAD_PER_SEC_MIN = 0.006
const OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM = 0.038
const OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN = 0.007
const PUNTA_ORBIT_RAD_PER_SEC_AT_1KM = 0.048
const PUNTA_ORBIT_RAD_PER_SEC_MIN = 0.01

const PUNTA_ARENAS_START_POSE: FlyPose = {
  longitude: -70.921316, latitude: -53.214332, height: 1252,
  heading: 6.103893, pitch: -0.232141, roll: 0,
}

const OVERVIEW_WAYPOINT = WAYPOINTS[0]

export type HudState = {
  cardinal: string
  headingDeg: number
  subsatLonDeg: number
  subsatLatDeg: number
}

type LocalOrbitState = {
  active: boolean
  target?: unknown
  offsetEnu?: { x: number; y: number; z: number }
  dir?: number
  radPerSecAt1km?: number
  radPerSecMin?: number
}

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
  localOrbitRef: MutableRefObject<LocalOrbitState>
  cameraFlightToSite1Ref: MutableRefObject<boolean>
  site1OrbitActiveRef: MutableRefObject<boolean>
  autoMotionEnabledRef: MutableRefObject<boolean>
  flyToCaboSite1Ref: MutableRefObject<(() => void) | null>
  navigateWaypointsByScrollRef: MutableRefObject<(dir: 1 | -1) => void>
  commitExploreCaptionRef: MutableRefObject<(raw: string | null) => void>
  pointerButtonsRef: MutableRefObject<number>
  lastUserInputMsRef: MutableRefObject<number>
  exploreMenuSelectionIdRef: MutableRefObject<string>
  /** When true, left-drag translates the camera and orbit auto-resumes after idle. */
  translateEnabledRef: MutableRefObject<boolean>
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

function dbg(...args: unknown[]): void {
  if (!shouldDebugCesium()) return
  // eslint-disable-next-line no-console
  console.log('[CesiumExplorer]', ...args)
}

function shouldLogCameraPose(): boolean {
  try {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV !== 'production') return true
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
  const canvasPointerDownRef = useRef<{ x: number; y: number; t: number; button: number } | null>(null)
  const initSeqRef = useRef(0)
  const groundHeightRef = useRef(0)

  // HUD throttle refs
  const lastHudCommitMsRef = useRef(0)
  const lastAslCommittedRef = useRef<number | null>(null)
  const lastAglCommittedRef = useRef<number | null>(null)
  const lastHudCommittedRef = useRef<HudState | null>({ cardinal: 'N', headingDeg: 0, subsatLonDeg: 0, subsatLatDeg: 0 })

  // Terrain sampling refs
  const lastTerrainSampleMsRef = useRef(0)
  const lastTerrainSampleLonLatRef = useRef<{ lon: number; lat: number } | null>(null)
  const lastSceneHeartbeatAtMsRef = useRef<number | null>(null)
  const lastPostUpdateMsRef = useRef<number | null>(null)

  // Debug / telemetry refs
  const postUpdateTickRef = useRef(0)
  const lastOrbitHeadingRef = useRef<number | null>(null)
  const lastOrbitAppliedTickRef = useRef(0)
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
    let viewer: CesiumViewer | null = null
    const mySeq = ++initSeqRef.current
    let cancelled = false

    const {
      isFlyingRef, cancelWaypointAnimRef, localOrbitRef, cameraFlightToSite1Ref,
      site1OrbitActiveRef, autoMotionEnabledRef, flyToCaboSite1Ref,
      navigateWaypointsByScrollRef, commitExploreCaptionRef,
      pointerButtonsRef, lastUserInputMsRef, exploreMenuSelectionIdRef,
      translateEnabledRef,
    } = shared

    const initCesium = async () => {
      setBootError(null)
      dbg('init:start', { seq: mySeq })
      const Cesium = await import('cesium')
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

      window.CESIUM_BASE_URL = `${window.location.origin}/_next/static/cesium/`
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

      viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider, baseLayer: false,
        baseLayerPicker: false, geocoder: false, homeButton: false,
        sceneModePicker: false, navigationHelpButton: false,
        animation: false, timeline: false, fullscreenButton: false,
        infoBox: false, selectionIndicator: false,
        creditContainer: document.createElement('div'),
        msaaSamples: isMobile ? 1 : 4,
      })
      viewer.imageryLayers.add(baseLayer)
      dbg('init:viewer-created', { isMobile })
      if (cancelled || initSeqRef.current !== mySeq) {
        try { viewer.destroy() } catch { /* noop */ }
        return
      }

      const osmViewer = viewer
      setTimeout(async () => {
        if (cancelled || initSeqRef.current !== mySeq) return
        if (!osmViewer || osmViewer.isDestroyed()) return
        try { osmViewer.scene.primitives.add(await Cesium.createOsmBuildingsAsync()) } catch { /* optional */ }
      }, 3000)

      viewerRef.current = viewer
      window.Cesium = Cesium
      if (cancelled || initSeqRef.current !== mySeq) return

      applyExplorerCameraInteractionScheme(Cesium, viewer)

      viewer.scene.verticalExaggeration = isMobile ? 1.5 : TERRAIN_EXAGGERATION
      viewer.scene.globe.enableLighting = true
      viewer.scene.globe.dynamicAtmosphereLighting = false
      viewer.scene.globe.atmosphereLightIntensity = 12.0
      viewer.scene.globe.atmosphereRayleighCoefficient = new Cesium.Cartesian3(5.5e-6, 13.0e-6, 28.4e-6)

      const initDate = new Date()
      initDate.setUTCHours(17, 0, 0, 0)
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(initDate)

      viewer.scene.atmosphere.brightnessShift = 0.45
      viewer.scene.atmosphere.saturationShift = 0.15
      viewer.scene.fog.enabled = false
      viewer.scene.globe.depthTestAgainstTerrain = true
      viewer.scene.backgroundColor = new Cesium.Color(0.0, 0.04, 0.1, 1.0)

      try { viewer.scene.globe.showWaterEffect = true; viewer.scene.globe.material = undefined } catch { /* optional */ }

      const skyBox = viewer.scene.skyBox as { show?: boolean } | undefined
      if (skyBox) skyBox.show = false
      const skyAtmosphere = viewer.scene.skyAtmosphere as { show?: boolean } | undefined
      if (skyAtmosphere) skyAtmosphere.show = false
      try { viewer.scene.globe.showGroundAtmosphere = false } catch { /* optional */ }

      viewer.shadows = !isMobile
      viewer.terrainShadows = isMobile ? Cesium.ShadowMode.DISABLED : Cesium.ShadowMode.ENABLED
      viewer.scene.postProcessStages.fxaa.enabled = true
      if (!isMobile) {
        viewer.scene.postProcessStages.bloom.enabled = true
        viewer.scene.postProcessStages.bloom.uniforms.contrast = 80
        viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.1
        viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false
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
        viewer.scene.postProcessStages.add(stage)
        nightTintStageRef.current = stage
      } catch { /* optional */ }

      viewer.resolutionScale = isMobile ? 0.70 : 0.88
      viewer.scene.globe.maximumScreenSpaceError = isMobile ? 5 : 3
      if (!isMobile) viewer.scene.globe.tileCacheSize = 200

      addBoatAnimation(viewer, Cesium)
      viewer.clock.shouldAnimate = false

      subdivisionParcelEntitiesRef.current = new Set()
      patagonValleyHaByKmlNameRef.current = {}
      kmlLayerAlphaRef.current = createInitialKmlLayerAlphas()
      applyKmlLayerTargetForWaypoint(exploreMenuSelectionIdRef.current, kmlLayerAlphaRef)

      const viewerForKml = viewer
      // Pre-compute base colors — shared across CallbackProperty closures
      const fillBase = Cesium.Color.fromCssColorString('#00e5ff')
      const fillSelected = Cesium.Color.fromCssColorString('#ffd54a')
      const lineBase = Cesium.Color.fromCssColorString('#00fff0')

      // ── Subdivision KMZ ───────────────────────────────────────────────────
      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SUBDIVISION_KMZ_URL, {
            camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas,
          })
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

              // ── PHASE 4 OPTIMIZATION: precompute static catalog data once ────
              // All string lookups, catalog reads and CSS color parsing happen here
              // (once per entity), not inside the per-frame CallbackProperty.
              const cachedRaw = entityKmlRawName(viewerForKml, entity)
              const cachedCat = getSubdivisionCatalogEntry(cachedRaw)
              const cachedBaseFill = (cachedCat
                ? Cesium.Color.fromCssColorString(cachedCat.fillCss)
                : fillBase.clone()) as typeof fillBase
              const cachedNoTint = cachedCat?.showPolygonFill === false
              // Scratch Color reused by this entity's callback — avoids per-frame allocation.
              const fillScratch = cachedBaseFill.clone()
              // Now the callback is just a ref-check + one multiply — no string/catalog lookups
              entity.polygon.material = new Cesium.ColorMaterialProperty(
                new Cesium.CallbackProperty(() => {
                  const isSelected = selectedParcelEntityRef.current === entity
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
              (e) => selectedParcelEntityRef.current === e,
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

          subdivisionParcelEntitiesRef.current = entitySet

          // Default parcel selection: J&P (24 ha)
          if (!cancelled && initSeqRef.current === mySeq && !viewerForKml.isDestroyed()) {
            for (const entity of ds.entities.values) {
              if (!entity.polygon) continue
              if (entityKmlRawName(viewerForKml, entity) !== KML_NAME_JP_24HA) continue
              selectedParcelEntityRef.current = entity
              const ll = centroidLonLatFromEntity(Cesium, viewerForKml, entity)
              const jp = getSubdivisionCatalogEntry(KML_NAME_JP_24HA)
              const defaultHa = jp?.areaHa != null && Number.isFinite(jp.areaHa)
                ? jp.areaHa
                : patagonValleyHaByKmlNameRef.current[KML_NAME_JP_24HA] ??
                  parcelAreaHaFromPolygonEntity(Cesium, viewerForKml, entity, patagonValleyHaByKmlNameRef.current) ??
                  undefined
              setSelectedParcelSale({
                title: jp?.displayName ?? 'Patagon Valley',
                longitude: ll?.lon ?? -70.841, latitude: ll?.lat ?? -52.935,
                areaHa: defaultHa, kmlRawName: KML_NAME_JP_24HA,
              })
              break
            }
          }
          dbg('init:subdivision-kmz', { entities: ds.entities.values.length })
        } catch (err) { warnOnce('subdivision-kmz', 'Subdivision KMZ failed to load.', err) }
      })()

      // ── Sociedades CN KMZ ──────────────────────────────────────────────────
      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SOCIEDADES_CN_KMZ_URL, {
            camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas,
          })
          if (cancelled || initSeqRef.current !== mySeq || viewerForKml.isDestroyed()) return
          await viewerForKml.dataSources.add(ds)
          ds.show = false
          await applySociedadesKmlStyling(viewerForKml, Cesium, ds, () => kmlLayerAlphaRef.current.sociedadesCn, SOCIEDADES_WALL_HEIGHT_M)
          for (const entity of ds.entities.values) {
            if (entity.billboard) entity.billboard.show = new Cesium.ConstantProperty(false)
            if (entity.label) entity.label.show = new Cesium.ConstantProperty(false)
            if (entity.point) entity.point.show = new Cesium.ConstantProperty(false)
            if (entityKmlRawName(viewerForKml, entity) === KML_NAME_JP_CONTINUADORA) entity.show = false
          }
          ds.show = true
          dbg('init:sociedades-cn-kmz', { entities: ds.entities.values.length })
        } catch (err) { warnOnce('sociedades-cn-kmz', 'Sociedades CN KMZ failed to load.', err) }
      })()

      // ── Sociedades CN-1 KMZ ────────────────────────────────────────────────
      ;(async () => {
        try {
          const ds = await Cesium.KmlDataSource.load(SOCIEDADES_CN1_KMZ_URL, {
            camera: viewerForKml.scene.camera, canvas: viewerForKml.scene.canvas,
          })
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

      // ── Orbit scratch vectors (created once, reused per frame) ─────────────
      const scratchOrbitEnu = new Cesium.Matrix4()
      const scratchOrbitInv = new Cesium.Matrix4()
      const scratchOrbitTmp = new Cesium.Cartesian3()
      const scratchOrbitWorldPos = new Cesium.Cartesian3()
      const scratchOrbitForward = new Cesium.Cartesian3()
      const scratchOrbitViewUp = new Cesium.Cartesian3()
      const scratchOrbitViewRight = new Cesium.Cartesian3()
      const scratchOrbitViewTmp = new Cesium.Cartesian3()
      const pickFallback = new Cesium.Cartesian3()
      const centerPx = new Cesium.Cartesian2()
      const scratchCamCarto = new Cesium.Cartographic()
      const terrainSampleCarto = new Cesium.Cartographic()
      let hudPostSkip = 0
      let lastTerrainUnderCamMs = 0

      // ── postUpdate: orbit, HUD, terrain sampling ───────────────────────────
      function onPostUpdate() {
        const v = viewerRef.current
        const C: CesiumModule = window.Cesium
        if (!v || v.isDestroyed() || !C) return

        lastSceneHeartbeatAtMsRef.current = performance.now()
        stepKmlLayerAlphas(kmlLayerAlphaRef)

        postUpdateTickRef.current++
        const scene = v.scene
        const cam = v.camera
        const ellipsoid = scene.globe.ellipsoid

        // ── Auto motion (orbit) ──────────────────────────────────────────────
        if (!autoMotionEnabledRef.current) {
          lastPostUpdateMsRef.current = null
        } else if (!isFlyingRef.current && !cameraFlightToSite1Ref.current) {
          const w = scene.canvas.clientWidth
          const h = scene.canvas.clientHeight
          const idleEnough = (performance.now() - lastUserInputMsRef.current) >= DRIFT_IDLE_AFTER_INPUT_MS
          const notDragging = pointerButtonsRef.current === 0
          if (w >= 2 && h >= 2 && idleEnough && notDragging) {
            const tNow = performance.now()
            const tPrev = lastPostUpdateMsRef.current ?? tNow
            lastPostUpdateMsRef.current = tNow
            const dt = Math.max(0, Math.min(0.15, (tNow - tPrev) / 1000))

            if (localOrbitRef.current.active) {
              if (!localOrbitRef.current.target) {
                C.Cartesian2.fromElements(w * 0.5, h * 0.5, centerPx)
                let surfacePoint = cam.pickEllipsoid(centerPx, ellipsoid)
                if (!C.defined(surfacePoint)) {
                  C.Cartographic.fromCartesian(cam.positionWC, ellipsoid, scratchCamCarto)
                  C.Cartesian3.fromRadians(scratchCamCarto.longitude, scratchCamCarto.latitude, 0, ellipsoid, pickFallback)
                  surfacePoint = pickFallback
                }
                localOrbitRef.current.target = surfacePoint
              }

              if (!localOrbitRef.current.offsetEnu && localOrbitRef.current.target) {
                syncOrbitOffsetEnuFromCamera(C, v, localOrbitRef, scratchOrbitEnu, scratchOrbitInv, scratchOrbitTmp)
              }

              const target = localOrbitRef.current.target as { x: number; y: number; z: number } | undefined
              const offsetEnu = localOrbitRef.current.offsetEnu
              if (!target || !offsetEnu) {
                lastOrbitAppliedTickRef.current = postUpdateTickRef.current
              } else {
                C.Cartographic.fromCartesian(cam.positionWC, ellipsoid, scratchCamCarto)
                const asl = scratchCamCarto.height
                const at1km = localOrbitRef.current.radPerSecAt1km ?? LOCAL_ORBIT_RAD_PER_SEC_AT_1KM
                const min = localOrbitRef.current.radPerSecMin ?? LOCAL_ORBIT_RAD_PER_SEC_MIN
                const dir = localOrbitRef.current.dir ?? +1
                const radPerSec = Math.max(min, Math.min(at1km, at1km * (1200 / Math.max(600, asl))))
                const dh = dir * radPerSec * dt
                rotateOrbitOffsetEnuAroundUp(offsetEnu, dh)
                if (Math.abs(dh) > ORBIT_MIN_STEP_RAD) {
                  applyOrbitCameraFromEnuOffset(
                    C, cam, ellipsoid, target, offsetEnu,
                    scratchOrbitEnu, scratchOrbitWorldPos, scratchOrbitForward,
                    scratchOrbitViewUp, scratchOrbitViewRight, scratchOrbitViewTmp,
                  )
                }
                lastOrbitAppliedTickRef.current = postUpdateTickRef.current
              }
            }
          }
        } else {
          lastPostUpdateMsRef.current = null
        }

        // ── Sync ctrl.enableTranslate with current waypoint ─────────────────
        const wantTranslate = translateEnabledRef.current
        const ctrl = scene.screenSpaceCameraController
        if (ctrl.enableTranslate !== wantTranslate) ctrl.enableTranslate = wantTranslate

        // ── Debug / pose logging ─────────────────────────────────────────────
        const now = performance.now()
        if (shouldDebugCesium() && now - lastDebugMsRef.current > 2500) {
          lastDebugMsRef.current = now
          const headingNow = cam.heading
          const prevHeading = lastOrbitHeadingRef.current
          const headingDelta = prevHeading === null ? null
            : Number((((headingNow - prevHeading + Math.PI) % (2 * Math.PI)) - Math.PI).toFixed(6))
          lastOrbitHeadingRef.current = headingNow
          dbg('tick', {
            tick: postUpdateTickRef.current,
            canvas: { w: scene.canvas.clientWidth, h: scene.canvas.clientHeight },
            flying: isFlyingRef.current, flightSite: cameraFlightToSite1Ref.current,
            buttons: pointerButtonsRef.current, heading: Number(cam.heading.toFixed(3)), headingDelta,
            orbitAppliedTick: lastOrbitAppliedTickRef.current,
          })
          if (scene.canvas.clientWidth < 2 || scene.canvas.clientHeight < 2) {
            warnOnce('canvas-0', 'canvas is ~0x0; WebGL will break.', { w: scene.canvas.clientWidth, h: scene.canvas.clientHeight })
          }
        }

        C.Cartographic.fromCartesian(cam.positionWC, ellipsoid, scratchCamCarto)
        const aslRounded = Math.round(scratchCamCarto.height)

        if (shouldLogCameraPose()) {
          const t = performance.now()
          if (t - lastPoseLogMsRef.current >= 700) {
            lastPoseLogMsRef.current = t
            const pose = {
              longitude: Number(C.Math.toDegrees(scratchCamCarto.longitude).toFixed(6)),
              latitude: Number(C.Math.toDegrees(scratchCamCarto.latitude).toFixed(6)),
              height: Math.round(scratchCamCarto.height),
              heading: Number(cam.heading.toFixed(6)), pitch: Number(cam.pitch.toFixed(6)), roll: Number(cam.roll.toFixed(6)),
            }
            const key = JSON.stringify(pose)
            if (key !== lastPoseLoggedRef.current) {
              lastPoseLoggedRef.current = key
              // eslint-disable-next-line no-console
              console.log('[CesiumExplorer] camera pose', pose)
            }
          }
        }

        // ── HUD React state (throttled, diff-gated) ─────────────────────────
        if (++hudPostSkip >= 2) {
          hudPostSkip = 0
          const commitDue = now - lastHudCommitMsRef.current >= 220
          if (commitDue) {
            lastHudCommitMsRef.current = now
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
            const nextHud: HudState = {
              cardinal: cardinal8(cam.heading),
              headingDeg: Number(C.Math.toDegrees(cam.heading).toFixed(1)),
              subsatLonDeg: Number(lonDeg.toFixed(5)),
              subsatLatDeg: Number(latDeg.toFixed(5)),
            }
            const prevHud = lastHudCommittedRef.current!
            if (nextHud.cardinal !== prevHud.cardinal || nextHud.headingDeg !== prevHud.headingDeg ||
              nextHud.subsatLonDeg !== prevHud.subsatLonDeg || nextHud.subsatLatDeg !== prevHud.subsatLatDeg) {
              lastHudCommittedRef.current = nextHud
              setHud(nextHud)
            }
          }
        }

        // ── AGL terrain sampling (throttled + movement-gated) ───────────────
        if (aslRounded < 5000) {
          const movedEnough = (() => {
            const last = lastTerrainSampleLonLatRef.current
            if (!last) return true
            const dLon = scratchCamCarto.longitude - last.lon
            const dLat = scratchCamCarto.latitude - last.lat
            return (dLon * dLon + dLat * dLat) >= (0.00015 * 0.00015)
          })()
          if (movedEnough && now - lastTerrainSampleMsRef.current >= Math.max(800, TERRAIN_UNDER_CAMERA_MS)) {
            lastTerrainSampleMsRef.current = now
            lastTerrainSampleLonLatRef.current = { lon: scratchCamCarto.longitude, lat: scratchCamCarto.latitude }
            if (now - lastTerrainUnderCamMs >= TERRAIN_UNDER_CAMERA_MS) {
              lastTerrainUnderCamMs = now
              C.Cartographic.fromRadians(scratchCamCarto.longitude, scratchCamCarto.latitude, 0, terrainSampleCarto)
              C.sampleTerrainMostDetailed(v.terrainProvider, [terrainSampleCarto])
                .then((sampled: unknown[]) => { groundHeightRef.current = (sampled[0] as { height?: number })?.height ?? 0 })
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

      // ── Initial camera position ────────────────────────────────────────────
      if (OVERVIEW_WAYPOINT) {
        const pose = orbitMathRef.current?.getDefaultExplorePose(OVERVIEW_WAYPOINT)
        if (!pose) throw new Error('[CesiumExplorer] orbitMath not ready (default pose).')
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height),
          orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
        })
        localOrbitRef.current.active = true
        localOrbitRef.current.dir = -1 // AUTO_ORBIT_WEST_SIGN
        localOrbitRef.current.radPerSecAt1km = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_AT_1KM
        localOrbitRef.current.radPerSecMin = OVERVIEW_STATION_ORBIT_RAD_PER_SEC_MIN
        // Target is intentionally left unset; postUpdate auto-picks from screen center on first tick.
        // Satisfy idle gate immediately so overview auto-orbit begins on first frames (no 900ms wait after load).
        lastUserInputMsRef.current = performance.now() - DRIFT_IDLE_AFTER_INPUT_MS - 1
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

      const canvas = viewer.scene.canvas
      const mousePx = new Cesium.Cartesian2()

      const onContextMenu = (e: Event) => e.preventDefault()

      const markInput = () => {
        lastUserInputMsRef.current = performance.now()
        cancelWaypointAnimRef.current?.()
        // Clear target/offsetEnu so the orbit auto-picks a fresh anchor after the
        // idle period expires. Do NOT set active=false — the idleEnough gate already
        // pauses orbit during interaction, and keeping active=true allows orbit to
        // resume automatically once the user stops dragging.
        localOrbitRef.current.target = undefined
        localOrbitRef.current.offsetEnu = undefined
        const v = viewerRef.current
        if (v && !v.isDestroyed()) { try { v.camera.cancelFlight() } catch { /* noop */ } }
      }

      const onCanvasClick = (e: MouseEvent) => {
        if (shouldDebugCesium()) dbg('canvas:click', { btn: e.button })
        const v = viewerRef.current
        const C: CesiumModule = window.Cesium
        if (!v || v.isDestroyed() || !C) return
        const boundsRect = canvas.getBoundingClientRect()
        C.Cartesian2.fromElements(e.clientX - boundsRect.left, e.clientY - boundsRect.top, mousePx)
        const parcelEntities = subdivisionParcelEntitiesRef.current
        const subdivisionVisible = kmlLayerAlphaRef.current.subdivision > 0.45
        if (parcelEntities.size > 0 && subdivisionVisible) {
          const id = findParcelEntityUnderCursor(v, C, mousePx, parcelEntities)
          if (id) {
            const ll = centroidLonLatFromEntity(C, v, id)
            selectedParcelEntityRef.current = id
            const raw = entityKmlRawName(v, id)
            const cat = getSubdivisionCatalogEntry(raw)
            const computedHa = parcelAreaHaFromPolygonEntity(C, v, id, patagonValleyHaByKmlNameRef.current)
            const areaHa = cat?.areaHa != null && Number.isFinite(cat.areaHa) ? cat.areaHa : computedHa ?? undefined
            setSelectedParcelSale({
              title: cat?.displayName ?? entityDisplayName(C, v, id),
              longitude: ll?.lon ?? -70.86, latitude: ll?.lat ?? -52.93,
              areaHa, kmlRawName: raw,
            })
            try { v.scene.requestRender() } catch { /* noop */ }
            lastUserInputMsRef.current = performance.now()
            return
          }
        }
        markInput()
      }

      const onCanvasPointerDown = () => {
        if (translateEnabledRef.current) {
          // Stop orbit immediately so Cesium can process the drag on this frame.
          markInput()
        } else {
          // Non-translate waypoints: gate orbit during click without disturbing anchor.
          lastUserInputMsRef.current = performance.now()
        }
      }

      let wheelAccPx = 0
      const onCanvasWheel = (e: WheelEvent) => {
        const v = viewerRef.current
        const C: CesiumModule = window.Cesium
        if (!v || v.isDestroyed() || !C) return
        e.preventDefault()
        e.stopPropagation()
        if (e.ctrlKey || e.metaKey) {
          markInput()
          const ellipsoid = v.scene.globe.ellipsoid
          const scratch = new C.Cartographic()
          C.Cartographic.fromCartesian(v.camera.positionWC, ellipsoid, scratch)
          const asl = Math.max(120, scratch.height)
          const amt = Math.max(80, Math.min(1_500_000, Math.abs(e.deltaY) * (asl * 0.008)))
          try { if (e.deltaY > 0) v.camera.zoomOut(amt); else v.camera.zoomIn(amt) } catch { /* noop */ }
          return
        }
        wheelAccPx += e.deltaY
        const stepPx = Math.max(260, Math.min(1200, Math.floor(window.innerHeight)))
        if (Math.abs(wheelAccPx) < stepPx) return
        const dir = wheelAccPx > 0 ? 1 : -1
        wheelAccPx = 0
        markInput()
        navigateWaypointsByScrollRef.current(dir as 1 | -1)
      }

      const onCanvasPointerMove = (e: PointerEvent) => {
        if (e.buttons !== 0 && translateEnabledRef.current) markInput()
      }

      const onCanvasPointerDownZoomGate = (e: PointerEvent) => {
        canvasPointerDownRef.current = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button }
      }
      const onCanvasPointerUpZoomGate = (e: PointerEvent) => {
        const down = canvasPointerDownRef.current
        canvasPointerDownRef.current = null
        if (!down) return
        if (!isClickLikeGesture({ x: down.x, y: down.y, t: down.t }, e.clientX, e.clientY)) return
        if (down.button === 0) onCanvasClick(e as unknown as MouseEvent)
      }

      canvas.addEventListener('pointerdown', onCanvasPointerDownZoomGate, true)
      canvas.addEventListener('pointerup', onCanvasPointerUpZoomGate, true)
      canvas.addEventListener('click', (e) => e.preventDefault(), true)
      canvas.addEventListener('contextmenu', onContextMenu)
      canvas.addEventListener('pointerdown', onCanvasPointerDown)
      canvas.addEventListener('wheel', onCanvasWheel, { passive: false })
      canvas.addEventListener('pointermove', onCanvasPointerMove)

      const ro = new ResizeObserver(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
      })
      ro.observe(containerRef.current!)

      const resizeKick = window.setInterval(() => {
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        if (v.scene.canvas.clientWidth < 2 || v.scene.canvas.clientHeight < 2) v.resize()
      }, 1200)

      const onLost = (ev: Event) => { ev.preventDefault?.(); dbg('webgl:context-lost') }
      const onRestored = () => {
        dbg('webgl:context-restored')
        const v = viewerRef.current
        if (!v || v.isDestroyed()) return
        v.resize()
      }
      canvas.addEventListener('webglcontextlost', onLost as EventListener, false)
      canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false)

      const renderErr = (viewer.scene as unknown as { renderError?: { addEventListener?: (fn: (e: unknown) => void) => void; removeEventListener?: (fn: (e: unknown) => void) => void } }).renderError
      const onRenderErr = (e: unknown) => { console.error('[CesiumExplorer] scene.renderError', e) }
      renderErr?.addEventListener?.(onRenderErr)

      viewerInteractionsCleanupRef.current = () => {
        canvas.removeEventListener('pointerdown', onCanvasPointerDownZoomGate, true)
        canvas.removeEventListener('pointerup', onCanvasPointerUpZoomGate, true)
        canvas.removeEventListener('contextmenu', onContextMenu)
        canvas.removeEventListener('pointerdown', onCanvasPointerDown)
        canvas.removeEventListener('wheel', onCanvasWheel as unknown as EventListener)
        canvas.removeEventListener('pointermove', onCanvasPointerMove)
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
      site1OrbitActiveRef.current = false

      setIsLoaded(true)
      setViewerNonce(n => n + 1)
      dbg('init:ready')
    }

    const safetyTimer = setTimeout(() => {
      if (!viewerRef.current) console.warn('[CesiumExplorer] Init still pending after 8s.')
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
      viewerRef.current = null
      delete window.Cesium
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
