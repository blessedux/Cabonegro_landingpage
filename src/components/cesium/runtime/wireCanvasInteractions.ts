'use client'

import type { Viewer as CesiumViewer } from 'cesium'
import type { MutableRefObject } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { isClickLikeGesture } from '@/lib/cesium/cameraUtils'
import { logCesiumInputThrottled, shouldLogCesiumInput } from '@/lib/cesium/cesiumInputDebug'
import {
  centroidLonLatFromEntity,
  entityDisplayName,
  entityKmlRawName,
  findParcelEntityUnderCursor,
  parcelAreaHaFromPolygonEntity,
} from '@/lib/cesium/entityUtils'
import { getSubdivisionCatalogEntry } from '@/lib/cesium/subdivisionParcelCatalog'
import type { KmlLayerAlphas } from '@/lib/cesium/kmlLayers'
import type { ParcelSalePick } from '@/components/cesium/InfoPanel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CesiumModule = any

export interface WireCanvasInteractionsOptions {
  viewer: CesiumViewer
  Cesium: CesiumModule
  container: HTMLDivElement
  // Shared refs
  kmlLayerAlphaRef: MutableRefObject<KmlLayerAlphas>
  subdivisionParcelEntitiesRef: MutableRefObject<Set<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedParcelEntityRef: MutableRefObject<any>
  patagonValleyHaByKmlNameRef: MutableRefObject<Record<string, number>>
  lastUserInputMsRef: MutableRefObject<number>
  pointerButtonsRef: MutableRefObject<number>
  primaryMouseButtonDownRef: MutableRefObject<boolean>
  cancelWaypointAnimRef: MutableRefObject<(() => void) | null>
  navigateWaypointsByScrollRef: MutableRefObject<(dir: 1 | -1) => void>
  isFlyingRef: MutableRefObject<boolean>
  translateEnabledRef: MutableRefObject<boolean>
  viewerRef: MutableRefObject<CesiumViewer | null>
  // Setters
  setSelectedParcelSale: Dispatch<SetStateAction<ParcelSalePick | null>>
  // Debug hook
  debug?: (label: string, payload?: Record<string, unknown>) => void
}

/**
 * Wires all canvas + window-level input listeners for the Cesium explorer.
 * Returns a single cleanup that removes every listener it added.
 *
 * Extracted from `useCesiumViewerRuntime` so the hook stays focused on viewer
 * lifecycle orchestration. All mutable state lives in the caller-owned refs;
 * this module only adds/removes event listeners and mutates those refs.
 */
export function wireCanvasInteractions(opts: WireCanvasInteractionsOptions): () => void {
  const {
    viewer,
    Cesium,
    container,
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
    debug,
  } = opts

  const canvas = viewer.scene.canvas
  const mousePx = new Cesium.Cartesian2()

  // Click-vs-drag gate (captured locally; does not outlive this wiring).
  let pointerDown: { x: number; y: number; t: number; button: number } | null = null
  let wheelAccPx = 0

  const markInput = () => {
    lastUserInputMsRef.current = performance.now()
    cancelWaypointAnimRef.current?.()
    const v = viewerRef.current
    if (v && !v.isDestroyed() && isFlyingRef.current) {
      try {
        v.camera.cancelFlight()
      } catch {
        /* noop */
      }
    }
  }

  const onContextMenu = (e: Event) => e.preventDefault()

  const onCanvasClick = (e: MouseEvent) => {
    debug?.('canvas:click', { btn: e.button })
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return
    const boundsRect = canvas.getBoundingClientRect()
    Cesium.Cartesian2.fromElements(
      e.clientX - boundsRect.left,
      e.clientY - boundsRect.top,
      mousePx,
    )
    const parcelEntities = subdivisionParcelEntitiesRef.current
    const subdivisionVisible = kmlLayerAlphaRef.current.subdivision > 0.45
    if (parcelEntities.size > 0 && subdivisionVisible) {
      const id = findParcelEntityUnderCursor(v, Cesium, mousePx, parcelEntities)
      if (id) {
        const ll = centroidLonLatFromEntity(Cesium, v, id)
        selectedParcelEntityRef.current = id
        const raw = entityKmlRawName(v, id)
        const cat = getSubdivisionCatalogEntry(raw)
        const computedHa = parcelAreaHaFromPolygonEntity(
          Cesium,
          v,
          id,
          patagonValleyHaByKmlNameRef.current,
        )
        const areaHa =
          cat?.areaHa != null && Number.isFinite(cat.areaHa)
            ? cat.areaHa
            : computedHa ?? undefined
        setSelectedParcelSale({
          title: cat?.displayName ?? entityDisplayName(Cesium, v, id),
          longitude: ll?.lon ?? -70.86,
          latitude: ll?.lat ?? -52.93,
          areaHa,
          kmlRawName: raw,
        })
        try {
          v.scene.requestRender()
        } catch {
          /* noop */
        }
        lastUserInputMsRef.current = performance.now()
        return
      }
    }
    markInput()
  }

  const onCanvasPointerDown = (e: PointerEvent) => {
    // Must mirror button state from the canvas — pointer events often do not bubble to the
    // React shell, so `postUpdate` orbit would think `notDragging` and fight ScreenSpaceCameraController.
    pointerButtonsRef.current = e.buttons
    if (e.button === 0) primaryMouseButtonDownRef.current = true
    if (translateEnabledRef.current) {
      markInput()
    } else {
      // Non-translate waypoints: gate orbit during click without disturbing anchor.
      lastUserInputMsRef.current = performance.now()
    }
  }

  const onCanvasWheel = (e: WheelEvent) => {
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return
    e.preventDefault()
    e.stopPropagation()
    if (e.ctrlKey || e.metaKey) {
      markInput()
      const ellipsoid = v.scene.globe.ellipsoid
      const scratch = new Cesium.Cartographic()
      Cesium.Cartographic.fromCartesian(v.camera.positionWC, ellipsoid, scratch)
      const asl = Math.max(120, scratch.height)
      const amt = Math.max(80, Math.min(1_500_000, Math.abs(e.deltaY) * (asl * 0.008)))
      try {
        if (e.deltaY > 0) v.camera.zoomOut(amt)
        else v.camera.zoomIn(amt)
      } catch {
        /* noop */
      }
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
    pointerButtonsRef.current = e.buttons
    if (shouldLogCesiumInput() && e.buttons !== 0) {
      const v = viewerRef.current
      const ctrl = v && !v.isDestroyed() ? v.scene.screenSpaceCameraController : null
      logCesiumInputThrottled('canvas:pointermove', {
        buttons: e.buttons,
        primaryDown: primaryMouseButtonDownRef.current,
        enableTranslate: ctrl?.enableTranslate,
        enableRotate: ctrl?.enableRotate,
      })
    }
  }

  const onPointerDownZoomGate = (e: PointerEvent) => {
    pointerButtonsRef.current = e.buttons
    pointerDown = { x: e.clientX, y: e.clientY, t: performance.now(), button: e.button }
  }
  const onPointerUpZoomGate = (e: PointerEvent) => {
    pointerButtonsRef.current = e.buttons
    if (e.button === 0) primaryMouseButtonDownRef.current = false
    const down = pointerDown
    pointerDown = null
    if (!down) return
    if (!isClickLikeGesture({ x: down.x, y: down.y, t: down.t }, e.clientX, e.clientY)) return
    if (down.button === 0) onCanvasClick(e as unknown as MouseEvent)
  }

  const onWebGlLost = (ev: Event) => {
    ev.preventDefault?.()
    debug?.('webgl:context-lost')
  }
  const onWebGlRestored = () => {
    debug?.('webgl:context-restored')
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return
    v.resize()
  }

  // The `renderError` event has drifted between Cesium versions; guard it with
  // a narrow type rather than importing a brittle internal type.
  const renderErr = (viewer.scene as unknown as {
    renderError?: {
      addEventListener?: (fn: (e: unknown) => void) => void
      removeEventListener?: (fn: (e: unknown) => void) => void
    }
  }).renderError
  const onRenderErr = (e: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[CesiumExplorer] scene.renderError', e)
  }
  renderErr?.addEventListener?.(onRenderErr)

  // Mouse events on the WebGL canvas do not always surface as PointerEvents with reliable
  // `e.buttons` for `postUpdate` orbit gating. Window-level capture keeps `pointerButtonsRef`
  // in sync so auto-orbit never fights ScreenSpaceCameraController during left-drag pan.
  const syncMouseButtonsFromWindow = (e: MouseEvent) => {
    pointerButtonsRef.current = e.buttons
  }
  /** Do not derive this from `mousemove` `e.buttons` — some stacks report 0 briefly mid-drag. */
  const onPrimaryMouseDownUp = (e: MouseEvent) => {
    if (e.button !== 0) return
    primaryMouseButtonDownRef.current = e.type === 'mousedown'
  }
  const onPointerCancelWindow = (e: PointerEvent) => {
    if (e.button === 0) primaryMouseButtonDownRef.current = false
    pointerButtonsRef.current = e.buttons
  }
  const onWindowBlur = () => {
    pointerButtonsRef.current = 0
    primaryMouseButtonDownRef.current = false
  }
  window.addEventListener('mousedown', syncMouseButtonsFromWindow, true)
  window.addEventListener('mousemove', syncMouseButtonsFromWindow, true)
  window.addEventListener('mouseup', syncMouseButtonsFromWindow, true)
  window.addEventListener('mousedown', onPrimaryMouseDownUp, true)
  window.addEventListener('mouseup', onPrimaryMouseDownUp, true)
  window.addEventListener('pointercancel', onPointerCancelWindow, true)
  window.addEventListener('blur', onWindowBlur)

  canvas.addEventListener('pointerdown', onPointerDownZoomGate, true)
  canvas.addEventListener('pointerup', onPointerUpZoomGate, true)
  canvas.addEventListener('contextmenu', onContextMenu)
  canvas.addEventListener('pointerdown', onCanvasPointerDown)
  canvas.addEventListener('wheel', onCanvasWheel, { passive: false })
  canvas.addEventListener('pointermove', onCanvasPointerMove)
  canvas.addEventListener('webglcontextlost', onWebGlLost as EventListener, false)
  canvas.addEventListener('webglcontextrestored', onWebGlRestored as EventListener, false)

  const ro = new ResizeObserver(() => {
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return
    v.resize()
  })
  ro.observe(container)

  // Some mobile browsers restart the canvas at 0×0 after layout thrash. A
  // lightweight poll keeps the viewer in sync without full re-init.
  const resizeKick = window.setInterval(() => {
    const v = viewerRef.current
    if (!v || v.isDestroyed()) return
    if (v.scene.canvas.clientWidth < 2 || v.scene.canvas.clientHeight < 2) v.resize()
  }, 1200)

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDownZoomGate, true)
    canvas.removeEventListener('pointerup', onPointerUpZoomGate, true)
    canvas.removeEventListener('contextmenu', onContextMenu)
    canvas.removeEventListener('pointerdown', onCanvasPointerDown)
    canvas.removeEventListener('wheel', onCanvasWheel as unknown as EventListener)
    canvas.removeEventListener('pointermove', onCanvasPointerMove)
    canvas.removeEventListener('webglcontextlost', onWebGlLost as EventListener, false)
    canvas.removeEventListener('webglcontextrestored', onWebGlRestored as EventListener, false)
    renderErr?.removeEventListener?.(onRenderErr)
    window.removeEventListener('mousedown', syncMouseButtonsFromWindow, true)
    window.removeEventListener('mousemove', syncMouseButtonsFromWindow, true)
    window.removeEventListener('mouseup', syncMouseButtonsFromWindow, true)
    window.removeEventListener('mousedown', onPrimaryMouseDownUp, true)
    window.removeEventListener('mouseup', onPrimaryMouseDownUp, true)
    window.removeEventListener('pointercancel', onPointerCancelWindow, true)
    window.removeEventListener('blur', onWindowBlur)
    window.clearInterval(resizeKick)
    ro.disconnect()
  }
}
