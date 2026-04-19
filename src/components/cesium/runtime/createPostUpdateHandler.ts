'use client'

import type { Viewer as CesiumViewer } from 'cesium'
import type { MutableRefObject } from 'react'
import { cardinal8 } from '@/lib/cesium/cameraUtils'
import { stepKmlLayerAlphas, type KmlLayerAlphas } from '@/lib/cesium/kmlLayers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

const TERRAIN_UNDER_CAMERA_MS = 400

export type HudState = {
  cardinal: string
  headingDeg: number
  subsatLonDeg: number
  subsatLatDeg: number
}

export interface CreatePostUpdateHandlerOptions {
  viewerRef: MutableRefObject<CesiumViewer | null>
  translateEnabledRef: MutableRefObject<boolean>
  // KML
  kmlLayerAlphaRef: MutableRefObject<KmlLayerAlphas>
  // Scene health
  lastSceneHeartbeatAtMsRef: MutableRefObject<number | null>
  // Ground sampling
  groundHeightRef: MutableRefObject<number>
  // HUD commit throttles
  lastHudCommitMsRef: MutableRefObject<number>
  lastAslCommittedRef: MutableRefObject<number | null>
  lastAglCommittedRef: MutableRefObject<number | null>
  lastHudCommittedRef: MutableRefObject<HudState | null>
  // State setters
  setAltitudeAsl: (v: number | null) => void
  setAltitudeAgl: (v: number | null) => void
  setHud: (v: HudState) => void
  // Pose logging
  shouldLogCameraPose: () => boolean
  lastPoseLogMsRef: MutableRefObject<number>
  lastPoseLoggedRef: MutableRefObject<string>
  // Idle orbit (auto-rotation after landing) — all optional for backward compat
  lastUserInputMsRef?: MutableRefObject<number>
  isFlyingRef?: MutableRefObject<boolean>
  primaryMouseButtonDownRef?: MutableRefObject<boolean>
  pointerButtonsRef?: MutableRefObject<number>
  // Optional debug hooks
  shouldDebugCesium?: () => boolean
  shouldDebugCesiumInput?: () => boolean
  debug?: (label: string, payload?: Record<string, unknown>) => void
  warnOnce?: (key: string, ...args: unknown[]) => void
  postUpdateTickRef?: MutableRefObject<number>
  lastOrbitHeadingRef?: MutableRefObject<number | null>
  lastDebugMsRef?: MutableRefObject<number>
}

/**
 * Builds the per-frame `scene.postUpdate` handler for the Cesium explorer.
 *
 * Camera motion is **only** from Cesium `ScreenSpaceCameraController` (left-drag pan,
 * right-drag rotate/tilt). This handler does not call `camera.setView` / orbit math.
 *
 * Responsibilities:
 *   1. HUD state commits (throttled + diff-gated).
 *   2. Ground-height sampling for the AGL readout (throttled + move-gated).
 *   3. KML layer alpha stepping.
 */
export function createPostUpdateHandler(opts: CreatePostUpdateHandlerOptions): () => void {
  const {
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
    lastUserInputMsRef,
    isFlyingRef,
    primaryMouseButtonDownRef,
    pointerButtonsRef,
    shouldDebugCesium,
    shouldDebugCesiumInput,
    debug,
    warnOnce,
    postUpdateTickRef,
    lastOrbitHeadingRef,
    lastDebugMsRef,
  } = opts

  /** Start slow idle orbit after this many ms of no user input. */
  const ORBIT_IDLE_MS = 3000
  /** ~1.5 degrees per second at 60 fps — gentle screensaver-style rotation. */
  const ORBIT_RAD_PER_FRAME = (1.5 * Math.PI / 180) / 60

  const C: CesiumModule = (typeof window !== 'undefined' ? window.Cesium : null) as CesiumModule
  if (!C) {
    return () => undefined
  }

  const scratchCamCarto = new C.Cartographic()
  const terrainSampleCarto = new C.Cartographic()

  let hudPostSkip = 0
  let lastTerrainUnderCamMs = 0
  let lastTerrainSampleMs = 0
  let lastTerrainSampleLonLat: { lon: number; lat: number } | null = null

  return function onPostUpdate(): void {
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return

    lastSceneHeartbeatAtMsRef.current = performance.now()
    stepKmlLayerAlphas(kmlLayerAlphaRef)

    if (postUpdateTickRef) postUpdateTickRef.current++
    const scene = v.scene
    const cam = v.camera
    const ellipsoid = scene.globe.ellipsoid

    // ── Keep ScreenSpaceCameraController in a known-good state ──────────
    // Some code paths (data sources / tilesets / Cesium internals) can flip flags;
    // left-drag pan + right-drag rotate require these every frame.
    const wantTranslate = translateEnabledRef.current
    const ctrl = scene.screenSpaceCameraController
    if (!ctrl.enableInputs) ctrl.enableInputs = true
    if (!ctrl.enableRotate) ctrl.enableRotate = true
    if (!ctrl.enableTilt) ctrl.enableTilt = true
    if (!ctrl.enableZoom) ctrl.enableZoom = true
    if (ctrl.enableTranslate !== wantTranslate) ctrl.enableTranslate = wantTranslate

    // ── Idle orbit (auto-rotation) ───────────────────────────────────────
    // After landing at a waypoint the camera stays still; after ORBIT_IDLE_MS of no
    // pointer/scroll input it slowly rotates. Any user interaction resets the timer
    // (via lastUserInputMsRef in wireCanvasInteractions) which immediately stops the orbit.
    if (
      lastUserInputMsRef &&
      isFlyingRef &&
      primaryMouseButtonDownRef &&
      pointerButtonsRef &&
      !isFlyingRef.current &&
      !primaryMouseButtonDownRef.current &&
      pointerButtonsRef.current === 0 &&
      now - lastUserInputMsRef.current > ORBIT_IDLE_MS
    ) {
      try { cam.rotateRight(ORBIT_RAD_PER_FRAME) } catch { /* noop */ }
    }

    // ── Debug / pose logging ─────────────────────────────────────────────
    const now = performance.now()
    const tickDebugIntervalMs =
      shouldDebugCesiumInput?.() && !shouldDebugCesium?.() ? 900 : 2500
    if (
      (shouldDebugCesium?.() || shouldDebugCesiumInput?.()) &&
      lastDebugMsRef &&
      now - lastDebugMsRef.current > tickDebugIntervalMs
    ) {
      lastDebugMsRef.current = now
      const headingNow = cam.heading
      const prevHeading = lastOrbitHeadingRef?.current ?? null
      const headingDelta =
        prevHeading === null
          ? null
          : Number((((headingNow - prevHeading + Math.PI) % (2 * Math.PI)) - Math.PI).toFixed(6))
      if (lastOrbitHeadingRef) lastOrbitHeadingRef.current = headingNow
      debug?.('tick', {
        tick: postUpdateTickRef?.current ?? 0,
        canvas: { w: scene.canvas.clientWidth, h: scene.canvas.clientHeight },
        enableTranslate: ctrl.enableTranslate,
        enableRotate: ctrl.enableRotate,
        enableInputs: ctrl.enableInputs,
        heading: Number(cam.heading.toFixed(3)),
        headingDelta,
      })
      if (scene.canvas.clientWidth < 2 || scene.canvas.clientHeight < 2) {
        warnOnce?.('canvas-0', 'canvas is ~0x0; WebGL will break.', {
          w: scene.canvas.clientWidth,
          h: scene.canvas.clientHeight,
        })
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

    // ── AGL terrain sampling (throttled + movement-gated) ───────────────
    if (aslRounded < 5000) {
      const last = lastTerrainSampleLonLat
      const movedEnough = (() => {
        if (!last) return true
        const dLon = scratchCamCarto.longitude - last.lon
        const dLat = scratchCamCarto.latitude - last.lat
        return dLon * dLon + dLat * dLat >= 0.00015 * 0.00015
      })()
      if (
        movedEnough &&
        now - lastTerrainSampleMs >= Math.max(800, TERRAIN_UNDER_CAMERA_MS)
      ) {
        lastTerrainSampleMs = now
        lastTerrainSampleLonLat = { lon: scratchCamCarto.longitude, lat: scratchCamCarto.latitude }
        if (now - lastTerrainUnderCamMs >= TERRAIN_UNDER_CAMERA_MS) {
          lastTerrainUnderCamMs = now
          C.Cartographic.fromRadians(
            scratchCamCarto.longitude,
            scratchCamCarto.latitude,
            0,
            terrainSampleCarto,
          )
          C.sampleTerrainMostDetailed(v.terrainProvider, [terrainSampleCarto])
            .then((sampled: unknown[]) => {
              groundHeightRef.current = (sampled[0] as { height?: number })?.height ?? 0
            })
            .catch(() => {
              /* ellipsoid / unsupported */
            })
        }
      }
    }
  }
}
