import {
  Cartesian3,
  Cartographic,
  Ellipsoid,
  Math as CesiumMath,
  Matrix4,
  Transforms,
} from 'cesium'
import type { Waypoint } from '@/lib/cesium/waypoints'
import { WAYPOINTS } from '@/lib/cesium/waypoints'

const EARTH_R = 6371000.0
const DEG = 180 / Math.PI

export function waypointRange(wp: Pick<Waypoint, 'height' | 'pitch'>): number {
  const sp = Math.abs(Math.sin(wp.pitch))
  return sp > 0.05 ? wp.height / sp : wp.height
}

function enuToLonLatH(
  focusLon: number, focusLat: number,
  east: number, north: number, up: number,
): [number, number, number] {
  const cosLat = Math.cos(focusLat / DEG)
  const lon = focusLon + (east / (EARTH_R * cosLat)) * DEG
  const lat = focusLat + (north / EARTH_R) * DEG
  return [lon, lat, up]
}

/**
 * Legacy flat-Earth orbit helper — lon/lat shift only; **third value is not ellipsoid height**.
 * Use `cameraWorldFromOrbitMeters` + `Cartographic.fromCartesian` for camera `setView` / `flyTo`.
 */
export function orbitCameraLLH(
  focusLon: number, focusLat: number,
  heading: number, pitch: number, range: number,
): [number, number, number] {
  const cosP = Math.cos(pitch), sinP = Math.sin(pitch)
  const sinH = Math.sin(heading), cosH = Math.cos(heading)
  return enuToLonLatH(
    focusLon, focusLat,
    range * cosP * sinH,
    range * cosP * cosH,
    -range * sinP,
  )
}

export function orbitHeadingFromCameraHeading(cameraHeadingRad: number): number {
  return cameraHeadingRad - Math.PI
}

/**
 * Vista General — three authored stations (left-click advances, right-click retreats).
 * Stage 0: regional; 1: approach; 2: site vicinity. Ellipsoid height + camera radians as logged from Cesium.
 *
 * Stage 2: default Vista General / Cabo Negro site orbit start (authored from live camera pose).
 */
export const OVERVIEW_CAMERA_STAGES = [
  {
    longitude: -73.017816,
    latitude: -49.572055,
    height: 284_919,
    heading: 2.749106,
    pitch: -0.558238,
    roll: 0,
  },
  {
    longitude: -71.1656,
    latitude: -52.492273,
    height: 27_123,
    heading: 2.712173,
    pitch: -0.476899,
    roll: 0,
  },
  {
    longitude: -76.503743,
    latitude: -51.697263,
    height: 201_300,
    heading: 1.87882,
    pitch: -0.495432,
    roll: 0,
  },
] as const

export const OVERVIEW_STAGE_COUNT = OVERVIEW_CAMERA_STAGES.length

/** Smooth fly duration between two overview indices (seconds). */
export function getOverviewFlightDurationSec(fromStage: number, toStage: number): number {
  const lo = Math.min(fromStage, toStage)
  const hi = Math.max(fromStage, toStage)
  if (lo === 0 && hi === 1) return 3.15
  if (lo === 1 && hi === 2) return 2.05
  return 2.45
}

/** Tighter “site 1” orbit anchor (logged) — same ENU solve as default explore, different heading/pitch/ASL. */
export const CABO_NEGRO_SITE1_CAMERA = {
  heading: 4.816373113747622,
  pitch: -1.0225741730945677,
  roll: 0.0016796376051875228,
  targetHeightM_asl: 16542,
} as const

/** Lon/lat/height + orientation for left-click fly-down from overview (Cabo Negro site orbit). */
export function getCaboNegroSite1Pose(focus: Pick<Waypoint, 'longitude' | 'latitude'>): {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
} {
  const { heading, pitch, roll, targetHeightM_asl } = CABO_NEGRO_SITE1_CAMERA
  const orbitH = orbitHeadingFromCameraHeading(heading)
  const range = orbitRangeForTargetAsl(
    focus.longitude, focus.latitude, orbitH, pitch, targetHeightM_asl,
  )
  const world = cameraWorldFromOrbitMeters(
    focus.longitude, focus.latitude, orbitH, pitch, range,
  )
  Cartographic.fromCartesian(world, WGS84, scratchCarto)
  return {
    longitude: CesiumMath.toDegrees(scratchCarto.longitude),
    latitude: CesiumMath.toDegrees(scratchCarto.latitude),
    height: scratchCarto.height,
    heading,
    pitch,
    roll,
  }
}

export interface CameraKeyframe {
  /** Seconds from scene start. */
  t: number
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
  /** Optional on-screen caption during this segment (shown until next keyframe). */
  caption?: string
}

/** Waypoint orbit keyframe: WGS84 lon/lat/height from ENU offset at focus (not flat `orbitCameraLLH` height). */
function keyframeFromWaypoint(
  wp: Waypoint,
  t: number,
  caption?: string,
): CameraKeyframe {
  const range = waypointRange(wp)
  const world = cameraWorldFromOrbitMeters(
    wp.longitude, wp.latitude, wp.heading, wp.pitch, range,
  )
  Cartographic.fromCartesian(world, WGS84, scratchCarto)
  return {
    t,
    longitude: CesiumMath.toDegrees(scratchCarto.longitude),
    latitude: CesiumMath.toDegrees(scratchCarto.latitude),
    height: scratchCarto.height,
    heading: wp.heading + Math.PI,
    pitch: wp.pitch,
    roll: 0,
    caption,
  }
}

function orbitSceneAroundWaypoint(
  wp: Waypoint,
  cameraHeadingStart: number,
  cameraHeadingEnd: number,
  pitchRad: number,
  rollRad: number,
  captionStart: string,
  captionEnd: string,
  durationSec: number,
): CameraKeyframe[] {
  const range = orbitRangeForTargetAsl(
    wp.longitude,
    wp.latitude,
    orbitHeadingFromCameraHeading(cameraHeadingStart),
    pitchRad,
    wp.height,
  )
  const w0 = cameraWorldFromOrbitMeters(
    wp.longitude, wp.latitude, orbitHeadingFromCameraHeading(cameraHeadingStart), pitchRad, range,
  )
  const w1 = cameraWorldFromOrbitMeters(
    wp.longitude, wp.latitude, orbitHeadingFromCameraHeading(cameraHeadingEnd), pitchRad, range,
  )
  Cartographic.fromCartesian(w0, WGS84, scratchCarto)
  const lon0 = CesiumMath.toDegrees(scratchCarto.longitude)
  const lat0 = CesiumMath.toDegrees(scratchCarto.latitude)
  const h0 = scratchCarto.height
  Cartographic.fromCartesian(w1, WGS84, scratchCarto)
  const lon1 = CesiumMath.toDegrees(scratchCarto.longitude)
  const lat1 = CesiumMath.toDegrees(scratchCarto.latitude)
  const h1 = scratchCarto.height
  return [
    { t: 0, longitude: lon0, latitude: lat0, height: h0, heading: cameraHeadingStart, pitch: pitchRad, roll: rollRad, caption: captionStart },
    { t: durationSec, longitude: lon1, latitude: lat1, height: h1, heading: cameraHeadingEnd, pitch: pitchRad, roll: rollRad, caption: captionEnd },
  ]
}

function wp(id: string) {
  const w = WAYPOINTS.find(x => x.id === id)
  if (!w) throw new Error(`Unknown waypoint ${id}`)
  return w
}

const WGS84 = Ellipsoid.WGS84
const scratchEnu = new Matrix4()
const scratchWorld = new Cartesian3()
const scratchOrigin = new Cartesian3()
const scratchCarto = new Cartographic()

/** Camera world position from orbit: offset in local ENU at focus, then to ECEF (correct ellipsoid height vs flat `orbitCameraLLH` “height”). */
function cameraWorldFromOrbitMeters(
  focusLonDeg: number,
  focusLatDeg: number,
  orbitHeadingRad: number,
  pitchRad: number,
  rangeM: number,
): Cartesian3 {
  const cosP = Math.cos(pitchRad)
  const sinP = Math.sin(pitchRad)
  const sinH = Math.sin(orbitHeadingRad)
  const cosH = Math.cos(orbitHeadingRad)
  const east = rangeM * cosP * sinH
  const north = rangeM * cosP * cosH
  const up = -rangeM * sinP
  const origin = Cartesian3.fromDegrees(focusLonDeg, focusLatDeg, 0, WGS84, scratchOrigin)
  Transforms.eastNorthUpToFixedFrame(origin, WGS84, scratchEnu)
  return Matrix4.multiplyByPoint(scratchEnu, new Cartesian3(east, north, up), scratchWorld)
}

function ellipsoidHeightFromOrbitRange(
  focusLonDeg: number,
  focusLatDeg: number,
  orbitHeadingRad: number,
  pitchRad: number,
  rangeM: number,
): number {
  const world = cameraWorldFromOrbitMeters(focusLonDeg, focusLatDeg, orbitHeadingRad, pitchRad, rangeM)
  Cartographic.fromCartesian(world, WGS84, scratchCarto)
  return scratchCarto.height
}

/** Binary-search orbit range so ellipsoid height ≈ `targetHeightM` (m). */
function orbitRangeForTargetAsl(
  focusLonDeg: number,
  focusLatDeg: number,
  orbitHeadingRad: number,
  pitchRad: number,
  targetHeightM: number,
): number {
  let lo = 50
  let hi = 4_000_000
  const hLo = ellipsoidHeightFromOrbitRange(focusLonDeg, focusLatDeg, orbitHeadingRad, pitchRad, lo)
  let hHi = ellipsoidHeightFromOrbitRange(focusLonDeg, focusLatDeg, orbitHeadingRad, pitchRad, hi)
  if (hLo > targetHeightM || hHi < targetHeightM) {
    hi = Math.min(12_000_000, hi * 2)
    hHi = ellipsoidHeightFromOrbitRange(focusLonDeg, focusLatDeg, orbitHeadingRad, pitchRad, hi)
  }
  for (let i = 0; i < 52; i++) {
    const mid = (lo + hi) * 0.5
    const h = ellipsoidHeightFromOrbitRange(focusLonDeg, focusLatDeg, orbitHeadingRad, pitchRad, mid)
    if (Math.abs(h - targetHeightM) < 0.35) return mid
    if (h < targetHeightM) lo = mid
    else hi = mid
  }
  return (lo + hi) * 0.5
}

export function getOverviewCameraPose(index: number): {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
} {
  const i = Math.max(0, Math.min(OVERVIEW_STAGE_COUNT - 1, index))
  const s = OVERVIEW_CAMERA_STAGES[i]
  return {
    longitude: s.longitude,
    latitude: s.latitude,
    height: s.height,
    heading: s.heading,
    pitch: s.pitch,
    roll: s.roll,
  }
}

/** Vista General default: site-vicinity overview (stage 2), not the distant regional pass (stage 0). */
const DEFAULT_EXPLORE_OVERVIEW_STAGE = 2

/** Lon/lat/height + orientation for default explore load. */
export function getDefaultExplorePose(_focus: Pick<Waypoint, 'longitude' | 'latitude'>): {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
} {
  void _focus
  return getOverviewCameraPose(DEFAULT_EXPLORE_OVERVIEW_STAGE)
}

/** Scripted “Vista General” fly-through: three poses match manual overview stages + `narr:overview-{0,1,2}`. */
function overviewExploreKeyframes(): CameraKeyframe[] {
  const captions = ['narr:overview-0', 'narr:overview-1', 'narr:overview-2'] as const
  const segSec = 4.2
  return [0, 1, 2].map((stageIdx) => {
    const p = getOverviewCameraPose(stageIdx)
    return {
      t: stageIdx * segSec,
      longitude: p.longitude,
      latitude: p.latitude,
      height: p.height,
      heading: p.heading,
      pitch: p.pitch,
      roll: p.roll,
      caption: captions[stageIdx],
    }
  })
}

/**
 * Scripted camera scenes per waypoint id.
 * Extend with more keyframes per location as needed.
 */
export const CAMERA_SCENES: Record<string, CameraKeyframe[]> = {
  overview: overviewExploreKeyframes(),
  'punta-arenas': orbitSceneAroundWaypoint(
    wp('punta-arenas'),
    0.6,   // start heading (Cesium camera heading)
    2.65,  // end heading (sweeps around the city)
    -1.12, // oblique look-down (not nadir)
    0,
    'narr:punta-kf-0',
    'narr:punta-kf-1',
    8,
  ),
  'terminal-maritimo': [
    {
      t: 0,
      longitude: -70.842343,
      latitude: -52.916083,
      height: 794,
      heading: 2.255994,
      pitch: -0.448934,
      roll: 0,
      caption: 'narr:terminal-kf-0',
    },
    {
      t: 11,
      longitude: -70.842343,
      latitude: -52.916083,
      height: 794,
      heading: 2.255994,
      pitch: -0.448934,
      roll: 0,
      caption: 'narr:terminal-kf-1',
    },
  ],
  'parque-logistico': [
    {
      t: 0,
      longitude: -70.911794,
      latitude: -52.916795,
      height: 1250,
      heading: 1.698834,
      pitch: -0.450194,
      roll: 0,
      caption: 'narr:logistico-kf-0',
    },
    {
      t: 8,
      longitude: -70.911794,
      latitude: -52.916795,
      height: 1250,
      heading: 1.698834,
      pitch: -0.450194,
      roll: 0,
      caption: 'narr:logistico-kf-1',
    },
  ],
  'parque-tecnologico': [
    {
      t: 0,
      longitude: -70.860034,
      latitude: -52.948507,
      height: 1037,
      heading: 0.466191,
      pitch: -0.468321,
      roll: 0,
      caption: 'narr:tecnologico-kf-0',
    },
    {
      t: 8,
      longitude: -70.860034,
      latitude: -52.948507,
      height: 1037,
      heading: 0.466191,
      pitch: -0.468321,
      roll: 0,
      caption: 'narr:tecnologico-kf-1',
    },
  ],
}

export function getSceneForWaypoint(id: string): CameraKeyframe[] | undefined {
  return CAMERA_SCENES[id]
}

/** Two-frame hold at the waypoint orbit pose (same convention as flyTo). */
export function fallbackSceneFromWaypoint(wp: Waypoint): CameraKeyframe[] {
  const range = waypointRange(wp)
  const world = cameraWorldFromOrbitMeters(
    wp.longitude, wp.latitude, wp.heading, wp.pitch, range,
  )
  Cartographic.fromCartesian(world, WGS84, scratchCarto)
  const k: CameraKeyframe = {
    t: 0,
    longitude: CesiumMath.toDegrees(scratchCarto.longitude),
    latitude: CesiumMath.toDegrees(scratchCarto.latitude),
    height: scratchCarto.height,
    heading: wp.heading + Math.PI,
    pitch: wp.pitch,
    roll: 0,
    caption: wp.labelEn,
  }
  return [k, { ...k, t: 6, caption: k.caption }]
}

export function getSceneKeyframesForWaypoint(wp: Waypoint): CameraKeyframe[] {
  return getSceneForWaypoint(wp.id) ?? fallbackSceneFromWaypoint(wp)
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u
}

function lerpAngleRad(a: number, b: number, u: number): number {
  let d = b - a
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return a + d * u
}

function lerpKeyframe(a: CameraKeyframe, b: CameraKeyframe, u: number): CameraKeyframe {
  return {
    t: lerp(a.t, b.t, u),
    longitude: lerp(a.longitude, b.longitude, u),
    latitude: lerp(a.latitude, b.latitude, u),
    height: lerp(a.height, b.height, u),
    heading: lerpAngleRad(a.heading, b.heading, u),
    pitch: lerp(a.pitch, b.pitch, u),
    roll: lerp(a.roll, b.roll, u),
  }
}

/**
 * Sample a piecewise-linear camera path; caption is taken from the segment start keyframe.
 */
export function sampleCameraSceneAt(
  keyframes: CameraKeyframe[],
  elapsedSec: number,
): { keyframe: CameraKeyframe, caption: string | undefined } {
  if (keyframes.length === 0) {
    throw new Error('[orbitMath] sampleCameraSceneAt: no keyframes')
  }
  const sorted = [...keyframes].sort((x, y) => x.t - y.t)
  const first = sorted[0]
  if (elapsedSec <= first.t) {
    return { keyframe: first, caption: first.caption }
  }
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const next = sorted[i]
    if (elapsedSec < next.t) {
      const u = (elapsedSec - prev.t) / (next.t - prev.t)
      return {
        keyframe: lerpKeyframe(prev, next, u),
        caption: prev.caption ?? next.caption,
      }
    }
  }
  const last = sorted[sorted.length - 1]
  return { keyframe: last, caption: last.caption }
}
