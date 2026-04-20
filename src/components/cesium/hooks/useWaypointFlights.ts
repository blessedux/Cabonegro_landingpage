'use client'

import { useCallback, type MutableRefObject, type Dispatch, type SetStateAction } from 'react'
import type { Viewer as CesiumViewer } from 'cesium'
import type { Waypoint } from '@/lib/cesium/waypoints'
import { WAYPOINTS } from '@/lib/cesium/waypoints'
import {
  applyKmlLayerTargetForWaypoint,
  type KmlLayerAlphas,
} from '@/lib/cesium/kmlLayers'
import {
  type FlyPose,
  estimateFlyDurationSec,
  sceneDurationSec,
} from '@/lib/cesium/cameraUtils'
import type { ParcelSalePick } from '@/components/cesium/InfoPanel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

export type CameraKeyframe = {
  t: number
  longitude: number
  latitude: number
  height: number
  heading: number
  pitch: number
  roll: number
  caption?: string
}

type OrbitMathModule = {
  getCaboNegroSite1Pose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => FlyPose
  getDefaultExplorePose: (focus: Pick<Waypoint, 'longitude' | 'latitude'>) => FlyPose
  getSceneKeyframesForWaypoint: (wp: Waypoint) => CameraKeyframe[]
  sampleCameraSceneAt: (kf: CameraKeyframe[], t: number) => { keyframe: CameraKeyframe; caption: string | undefined }
}

const WAYPOINT_HUD_HOLD_MS = 4000
const FLY_TO_SITE1_DURATION_SEC = 4.8

const PUNTA_ARENAS_START_POSE: FlyPose = {
  longitude: -70.921316, latitude: -53.214332, height: 1252,
  heading: 6.103893, pitch: -0.232141, roll: 0,
}
const LOGISTICS_PARK_START_POSE: FlyPose = {
  longitude: -70.911794, latitude: -52.916795, height: 1250,
  heading: 1.698834, pitch: -0.450194, roll: 0,
}
const MARITIME_TERMINAL_START_POSE: FlyPose = {
  longitude: -70.842343, latitude: -52.916083, height: 794,
  heading: 2.255994, pitch: -0.448934, roll: 0,
}
const TECHNOLOGY_PARK_START_POSE: FlyPose = {
  longitude: -70.860034, latitude: -52.948507, height: 1037,
  heading: 0.466191, pitch: -0.468321, roll: 0,
}

// Cap waypoint-scene setView rate to limit tile/GPU churn.
const WAYPOINT_SETVIEW_MIN_INTERVAL_MS = 1000 / 6

const OVERVIEW_WAYPOINT = WAYPOINTS[0]

interface UseWaypointFlightsOptions {
  viewerRef: MutableRefObject<CesiumViewer | null>
  orbitMathRef: MutableRefObject<OrbitMathModule | null>
  isFlyingRef: MutableRefObject<boolean>
  cameraFlightToSite1Ref: MutableRefObject<boolean>
  site1OrbitActiveRef: MutableRefObject<boolean>
  cancelWaypointAnimRef: MutableRefObject<(() => void) | null>
  kmlLayerAlphaRef: MutableRefObject<KmlLayerAlphas>
  lastUserInputMsRef: MutableRefObject<number>
  commitExploreCaptionRef: MutableRefObject<(raw: string | null) => void>
  waypointTargetingTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  setIsFlying: (v: boolean) => void
  setActiveWaypoint: (v: Waypoint | null) => void
  setWaypointTargetingKey: (fn: (k: number) => number) => void
  setWaypointTargetingVisible: (v: boolean) => void
  setSelectedParcelSale: Dispatch<SetStateAction<ParcelSalePick | null>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedParcelEntityRef: MutableRefObject<any>
  activeWaypointId: string | undefined
}

export function useWaypointFlights({
  viewerRef,
  orbitMathRef,
  isFlyingRef,
  cameraFlightToSite1Ref,
  site1OrbitActiveRef,
  cancelWaypointAnimRef,
  kmlLayerAlphaRef,
  lastUserInputMsRef,
  commitExploreCaptionRef,
  waypointTargetingTimerRef,
  setIsFlying,
  setActiveWaypoint,
  setWaypointTargetingKey,
  setWaypointTargetingVisible,
  setSelectedParcelSale,
  selectedParcelEntityRef,
  activeWaypointId,
}: UseWaypointFlightsOptions) {

  const flyToCaboNegroSite1 = useCallback(() => {
    const viewer = viewerRef.current
    const Cesium: CesiumModule = window.Cesium
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
        orientation: { heading: pose.heading, pitch: pose.pitch, roll: pose.roll },
        duration: FLY_TO_SITE1_DURATION_SEC,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: () => { cameraFlightToSite1Ref.current = false; site1OrbitActiveRef.current = true },
        cancel: () => { cameraFlightToSite1Ref.current = false },
      })
    } catch (err) {
      console.error('[CesiumExplorer] camera.flyTo (Cabo site) failed:', err)
      cameraFlightToSite1Ref.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flyToWaypoint = useCallback((waypoint: Waypoint) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed()) return
    const Cesium: CesiumModule = window.Cesium
    if (!Cesium) return
    const orbitMath = orbitMathRef.current
    if (!orbitMath) {
      console.warn('[CesiumExplorer] orbitMath not ready yet (waypoint).')
      return
    }

    // Clear any selected parcel so the narrative card shows the new waypoint.
    setSelectedParcelSale(null)
    selectedParcelEntityRef.current = null

    if (waypointTargetingTimerRef.current) clearTimeout(waypointTargetingTimerRef.current)
    setWaypointTargetingKey(k => k + 1)
    setWaypointTargetingVisible(true)
    waypointTargetingTimerRef.current = setTimeout(() => {
      setWaypointTargetingVisible(false)
      waypointTargetingTimerRef.current = null
    }, WAYPOINT_HUD_HOLD_MS)

    applyKmlLayerTargetForWaypoint(waypoint.id, kmlLayerAlphaRef)

    site1OrbitActiveRef.current = false
    cameraFlightToSite1Ref.current = false
    try { viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY) } catch { /* noop */ }

    cancelWaypointAnimRef.current?.()
    cancelWaypointAnimRef.current = null
    try { viewer.camera.cancelFlight() } catch { /* noop */ }

    /** Fly to a curated pose; camera stays user-controlled afterward (no postUpdate orbit). */
    const flyToPoseThen = (pose: FlyPose, narrKey: string) => {
      isFlyingRef.current = true
      setIsFlying(true)
      setActiveWaypoint(waypoint)
      commitExploreCaptionRef.current(narrKey)
      try { viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY) } catch { /* noop */ }
      const destination = Cesium.Cartesian3.fromDegrees(pose.longitude, pose.latitude, pose.height)
      const finalOrientation = { heading: pose.heading, pitch: pose.pitch, roll: pose.roll }
      const duration = estimateFlyDurationSec(viewer, Cesium, pose)
      const finishFlight = () => {
        isFlyingRef.current = false
        setIsFlying(false)
        lastUserInputMsRef.current = performance.now()
      }
      const cancelFlight = () => { isFlyingRef.current = false; setIsFlying(false) }
      try {
        viewer.camera.flyTo({
          destination, orientation: finalOrientation, duration,
          easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
          complete: finishFlight, cancel: cancelFlight,
        })
      } catch (err) {
        console.error('[CesiumExplorer] camera.flyTo (waypoint) failed:', err)
        cancelFlight()
      }
    }

    if (waypoint.id === 'punta-arenas') {
      flyToPoseThen({ ...PUNTA_ARENAS_START_POSE }, 'narr:punta-arenas')
      return
    }

    if (waypoint.id === 'overview' && OVERVIEW_WAYPOINT) {
      const pose = orbitMath.getDefaultExplorePose(OVERVIEW_WAYPOINT)
      if (!pose) return
      flyToPoseThen({ ...pose }, 'narr:overview-2')
      return
    }

    if (waypoint.id === 'parque-logistico') {
      flyToPoseThen({ ...LOGISTICS_PARK_START_POSE }, 'narr:parque-logistico')
      return
    }

    if (waypoint.id === 'terminal-maritimo') {
      flyToPoseThen({ ...MARITIME_TERMINAL_START_POSE }, 'narr:terminal-maritimo')
      return
    }

    if (waypoint.id === 'parque-tecnologico') {
      flyToPoseThen({ ...TECHNOLOGY_PARK_START_POSE }, 'narr:parque-tecnologico')
      return
    }

    // Keyframe scene animation
    isFlyingRef.current = true
    setIsFlying(true)
    setActiveWaypoint(waypoint)
    if (waypoint.id !== 'overview') commitExploreCaptionRef.current(null)

    const keyframes = orbitMath.getSceneKeyframesForWaypoint(waypoint)
    const durationSec = sceneDurationSec(keyframes)
    const t0 = performance.now()
    const rafRef = { id: 0 }
    let lastSetViewMs = 0

    const finish = () => {
      cancelWaypointAnimRef.current = null
      isFlyingRef.current = false
      setIsFlying(false)
      commitExploreCaptionRef.current(null)
    }

    const step = () => {
      if (!viewerRef.current || viewerRef.current.isDestroyed()) { finish(); return }
      try {
        const now = performance.now()
        const elapsed = (now - t0) / 1000
        const clampedElapsed = Math.min(elapsed, durationSec)
        const { keyframe, caption } = orbitMath.sampleCameraSceneAt(keyframes, clampedElapsed)
        commitExploreCaptionRef.current(caption ?? null)

        if (elapsed >= durationSec) {
          viewerRef.current.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(keyframe.longitude, keyframe.latitude, keyframe.height),
            orientation: { heading: keyframe.heading, pitch: keyframe.pitch, roll: keyframe.roll },
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
          destination: Cesium.Cartesian3.fromDegrees(keyframe.longitude, keyframe.latitude, keyframe.height),
          orientation: { heading: keyframe.heading, pitch: keyframe.pitch, roll: keyframe.roll },
        })
        rafRef.id = requestAnimationFrame(step)
      } catch (err) {
        console.error('[CesiumExplorer] waypoint scene step failed:', err)
        finish()
      }
    }

    try {
      const first = keyframes[0]!
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(first.longitude, first.latitude, first.height),
        orientation: { heading: first.heading, pitch: first.pitch, roll: first.roll },
      })
      commitExploreCaptionRef.current(first.caption ?? null)
    } catch (err) {
      console.error('[CesiumExplorer] waypoint scene start failed:', err)
      finish()
      return
    }

    rafRef.id = requestAnimationFrame(step)
    cancelWaypointAnimRef.current = () => { cancelAnimationFrame(rafRef.id); finish() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigateWaypointsByScroll = useCallback((direction: 1 | -1) => {
    if (isFlyingRef.current || cameraFlightToSite1Ref.current) return
    const curIdx = activeWaypointId
      ? WAYPOINTS.findIndex(w => w.id === activeWaypointId)
      : 0
    const i = curIdx < 0 ? 0 : curIdx
    const lastIdx = WAYPOINTS.length - 1
    if (i === lastIdx && direction === 1) { flyToWaypoint(WAYPOINTS[0]!); return }
    if (i === 0 && direction === -1) return
    const next = Math.max(0, Math.min(lastIdx, i + direction))
    if (next === i) return
    flyToWaypoint(WAYPOINTS[next]!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWaypointId, flyToWaypoint])

  return { flyToWaypoint, flyToCaboNegroSite1, navigateWaypointsByScroll }
}
