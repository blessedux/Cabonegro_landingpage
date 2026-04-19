/**
 * Pure camera/orbit utilities for the Cesium Explorer.
 * All functions receive the Cesium module (dynamically imported) as a parameter.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

import type { Viewer as CesiumViewer } from 'cesium'

export type FlyPose = {
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
}

/** Longer hops get longer flyTo; clamp keeps menu navigation snappy. */
export function estimateFlyDurationSec(
  viewer: CesiumViewer,
  Cesium: CesiumModule,
  pose: Pick<FlyPose, 'longitude' | 'latitude' | 'height'>,
): number {
  const from = viewer.camera.positionWC
  const to = Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height)
  const d = Cesium.Cartesian3.distance(from, to)
  return Math.min(14, Math.max(3.4, d / 420_000))
}

/**
 * Left-drag = pan camera; right-drag = rotate + tilt.
 * Wheel-zoom disabled at controller level (reserved for waypoint navigation).
 */
export function applyExplorerCameraInteractionScheme(
  Cesium: CesiumModule,
  viewer: CesiumViewer,
): void {
  const CameraEventType = Cesium.CameraEventType
  const KeyboardEventModifier = Cesium.KeyboardEventModifier
  const ctrl = viewer.scene.screenSpaceCameraController

  const left = CameraEventType.LEFT_DRAG
  const right = CameraEventType.RIGHT_DRAG
  const M = KeyboardEventModifier

  const translateInputs = [
    left,
    { eventType: left, modifier: M.CTRL },
    { eventType: left, modifier: M.SHIFT },
    { eventType: left, modifier: M.ALT },
  ]
  const angleInputs = [
    right,
    { eventType: right, modifier: M.CTRL },
    { eventType: right, modifier: M.SHIFT },
    { eventType: right, modifier: M.ALT },
  ]

  ctrl.translateEventTypes = translateInputs as typeof ctrl.translateEventTypes
  ctrl.enableTranslate = true
  ctrl.rotateEventTypes = angleInputs as typeof ctrl.rotateEventTypes
  ctrl.enableRotate = true
  ctrl.tiltEventTypes = angleInputs as typeof ctrl.tiltEventTypes
  ctrl.zoomEventTypes = [CameraEventType.PINCH]
  ctrl.enableTilt = true
  ctrl.enableLook = false
  ctrl.enableZoom = true
  ctrl.minimumZoomDistance = 50
  ctrl.maximumZoomDistance = 50_000_000
  ctrl.inertiaSpin = 0
  ctrl.inertiaTranslate = 0
  ctrl.inertiaZoom = 0
}

/** Set orbit pivot to the ground point under the authored waypoint lon/lat. */
export function setOrbitTargetFromPoseLonLat(
  Cesium: CesiumModule,
  ellipsoid: NonNullable<Parameters<typeof Cesium.Cartesian3.fromDegrees>[3]>,
  pose: Pick<FlyPose, 'longitude' | 'latitude'>,
  orbit: { current: { target?: unknown } },
): void {
  orbit.current.target = Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, 0, ellipsoid)
}

/**
 * Snapshot the ENU offset (camera - target) for use by the auto-orbit.
 * Uses world-frame camera position so no snap after flyTo/setView.
 */
export function syncOrbitOffsetEnuFromCamera(
  Cesium: CesiumModule,
  viewer: CesiumViewer,
  orbit: { current: { target?: unknown; offsetEnu?: { x: number; y: number; z: number } } },
  scratchEnu: unknown,
  scratchInv: unknown,
  scratchTmp: unknown,
): void {
  const target = orbit.current.target as { x: number; y: number; z: number } | undefined
  if (!target || !Cesium.defined(target)) return
  const ellipsoid = viewer.scene.globe.ellipsoid
  Cesium.Transforms.eastNorthUpToFixedFrame(target, ellipsoid, scratchEnu as never)
  Cesium.Matrix4.inverse(scratchEnu as never, scratchInv as never)
  Cesium.Matrix4.multiplyByPoint(scratchInv as never, viewer.camera.positionWC, scratchTmp as never)
  if (!orbit.current.offsetEnu) orbit.current.offsetEnu = new Cesium.Cartesian3()
  Cesium.Cartesian3.clone(scratchTmp as never, orbit.current.offsetEnu as never)
}

/**
 * Drive camera position from ENU offset around target.
 * Uses setView(direction, up) instead of lookAtTransform to avoid quaternion
 * snap after flyTo/setView sequences.
 */
export function applyOrbitCameraFromEnuOffset(
  Cesium: CesiumModule,
  camera: CesiumViewer['camera'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ellipsoid: any,
  target: { x: number; y: number; z: number },
  offsetEnu: { x: number; y: number; z: number },
  enuScratch: unknown,
  worldPos: unknown,
  forward: unknown,
  up: unknown,
  right: unknown,
  tmp: unknown,
): void {
  Cesium.Transforms.eastNorthUpToFixedFrame(target, ellipsoid, enuScratch as never)
  Cesium.Matrix4.multiplyByPoint(enuScratch as never, offsetEnu as never, worldPos as never)
  Cesium.Cartesian3.subtract(target, worldPos as never, forward as never)
  if (Cesium.Cartesian3.magnitudeSquared(forward as never) < 1e-6) return
  Cesium.Cartesian3.normalize(forward as never, forward as never)
  ellipsoid.geodeticSurfaceNormal(worldPos as never, up as never)
  const align = Cesium.Cartesian3.dot(up as never, forward as never)
  Cesium.Cartesian3.multiplyByScalar(forward as never, align, tmp as never)
  Cesium.Cartesian3.subtract(up as never, tmp as never, up as never)
  if (Cesium.Cartesian3.magnitudeSquared(up as never) < 1e-20) {
    Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, forward as never, up as never)
  }
  Cesium.Cartesian3.normalize(up as never, up as never)
  Cesium.Cartesian3.cross(forward as never, up as never, right as never)
  Cesium.Cartesian3.normalize(right as never, right as never)
  Cesium.Cartesian3.cross(right as never, forward as never, up as never)
  Cesium.Cartesian3.normalize(up as never, up as never)
  camera.setView({
    destination: worldPos as never,
    orientation: { direction: forward as never, up: up as never },
  })
}

/** Rotate ENU offset vector around local vertical (Z) by delta radians. */
export function rotateOrbitOffsetEnuAroundUp(
  offset: { x: number; y: number; z: number },
  deltaRad: number,
): void {
  const x = offset.x
  const y = offset.y
  const c = Math.cos(deltaRad)
  const s = Math.sin(deltaRad)
  offset.x = x * c - y * s
  offset.y = x * s + y * c
}

export function cardinal8(headingRad: number): string {
  const d = ((headingRad * 180 / Math.PI) % 360 + 360) % 360
  const rose = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return rose[Math.round(d / 45) % 8]!
}

export function formatAlt(m: number): string {
  const r = Math.round(m)
  if (r >= 100_000) return `${(r / 1000).toFixed(0)} km`
  return `${r.toLocaleString('en-US')} m`
}

export function isClickLikeGesture(
  down: { x: number; y: number; t: number } | null,
  upX: number,
  upY: number,
): boolean {
  if (!down) return false
  const dx = upX - down.x
  const dy = upY - down.y
  const dist2 = dx * dx + dy * dy
  const dt = performance.now() - down.t
  return dist2 <= (6 * 6) && dt <= 350
}

export function sceneDurationSec(keyframes: { t: number }[]): number {
  if (keyframes.length === 0) return 0
  return Math.max(...keyframes.map(k => k.t))
}
