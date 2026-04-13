'use client'

import { useEffect, useRef, useCallback, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Cesium3DTileset, Viewer as CesiumViewer } from 'cesium'
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
  latitude: -53.1638,
  height: 14000,
} as const

const OVERVIEW_WAYPOINT = WAYPOINTS[0]
const DRAG_HEADING_SENSITIVITY = 0.004
const DRAG_PITCH_SENSITIVITY = 0.003
const HOVER_PITCH_INFLUENCE = 0.08
const HOVER_HEADING_INFLUENCE = 0.12
const CAMERA_SMOOTHING = 0.08

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

interface GuidedCameraState {
  baseLongitude: number
  baseLatitude: number
  baseHeight: number
  baseHeading: number
  basePitch: number
  hoverX: number
  hoverY: number
  headingOffset: number
  pitchOffset: number
  currentLongitude: number
  currentLatitude: number
  currentHeight: number
  currentHeading: number
  currentPitch: number
}

function addBoatAnimation(viewer: CesiumViewer, Cesium: CesiumModule) {
  const startTime = Cesium.JulianDate.fromDate(new Date())
  const stopTime = Cesium.JulianDate.addSeconds(
    startTime,
    300,
    new Cesium.JulianDate()
  )

  const position = new Cesium.SampledPositionProperty()
  const routePoints = [
    { lon: -70.32, lat: -52.84, t: 0 },
    { lon: -70.28, lat: -52.83, t: 60 },
    { lon: -70.24, lat: -52.84, t: 120 },
    { lon: -70.20, lat: -52.85, t: 180 },
    { lon: -70.16, lat: -52.85, t: 240 },
    { lon: -70.12, lat: -52.84, t: 300 },
  ]

  for (const pt of routePoints) {
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      pt.t,
      new Cesium.JulianDate()
    )
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

  viewer.clock.startTime = startTime
  viewer.clock.stopTime = stopTime
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
  viewer.clock.multiplier = 1
  viewer.clock.shouldAnimate = true
}


function addSiteMarkers(viewer: CesiumViewer, Cesium: CesiumModule) {
  const t0 = Date.now()

  const sites = [
    {
      lon: -70.851937, lat: -52.927339,
      label: 'Cabo Negro — Site 1',
      color: '#00d4ff',
    },
    {
      lon: -70.858379, lat: -52.927713,
      label: 'Site 2',
      color: '#4dffb0',
    },
    {
      lon: -70.9171,  lat: -53.1638,
      label: 'Punta Arenas',
      color: '#ff9f43',
    },
  ]

  for (const site of sites) {
    const base = Cesium.Color.fromCssColorString(site.color)

    // Pulsing outer ring
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(site.lon, site.lat, 20),
      point: {
        pixelSize: new Cesium.CallbackProperty(() => {
          const t = (Date.now() - t0) / 1000
          return 18 + Math.sin(t * 2.2) * 6          // 12 → 24 px pulse
        }, false),
        color: new Cesium.CallbackProperty(() => {
          const t = (Date.now() - t0) / 1000
          return base.withAlpha(0.25 + Math.sin(t * 2.2) * 0.20)
        }, false),
        outlineColor: Cesium.Color.TRANSPARENT,
        outlineWidth: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(500, 1.8, 150000, 0.4),
      },
    })

    // Solid inner dot
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

export default function CesiumExplorer({ locale = 'en' }: CesiumExplorerProps) {
  const { push } = useNavigateWithPreloader()
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<CesiumViewer | null>(null)
  const googleTilesetRef = useRef<Cesium3DTileset | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const dragStateRef = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const guidedCameraRef = useRef<GuidedCameraState>({
    baseLongitude: OVERVIEW_WAYPOINT?.longitude ?? PUNTA_ARENAS_START.longitude,
    baseLatitude: OVERVIEW_WAYPOINT?.latitude ?? PUNTA_ARENAS_START.latitude,
    baseHeight: OVERVIEW_WAYPOINT?.height ?? PUNTA_ARENAS_START.height,
    baseHeading: OVERVIEW_WAYPOINT?.heading ?? 0,
    basePitch: OVERVIEW_WAYPOINT?.pitch ?? -0.5,
    hoverX: 0,
    hoverY: 0,
    headingOffset: 0,
    pitchOffset: 0,
    currentLongitude: OVERVIEW_WAYPOINT?.longitude ?? PUNTA_ARENAS_START.longitude,
    currentLatitude: OVERVIEW_WAYPOINT?.latitude ?? PUNTA_ARENAS_START.latitude,
    currentHeight: OVERVIEW_WAYPOINT?.height ?? PUNTA_ARENAS_START.height,
    currentHeading: OVERVIEW_WAYPOINT?.heading ?? 0,
    currentPitch: OVERVIEW_WAYPOINT?.pitch ?? -0.5,
  })
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(OVERVIEW_WAYPOINT ?? null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [hasPhotorealisticLand, setHasPhotorealisticLand] = useState(false)
  const [photorealisticEnabled, setPhotorealisticEnabled] = useState(true)
  const [timeOfDay, setTimeOfDay] = useState(14) // 14:00 local = bright afternoon

  const applyWaypointGuide = useCallback((waypoint: Waypoint) => {
    const guide = guidedCameraRef.current
    guide.baseLongitude = waypoint.longitude
    guide.baseLatitude = waypoint.latitude
    guide.baseHeight = waypoint.height
    guide.baseHeading = waypoint.heading
    guide.basePitch = waypoint.pitch
    guide.hoverX = 0
    guide.hoverY = 0
    guide.headingOffset = 0
    guide.pitchOffset = 0
    guide.currentLongitude = waypoint.longitude
    guide.currentLatitude = waypoint.latitude
    guide.currentHeight = waypoint.height
    guide.currentHeading = waypoint.heading
    guide.currentPitch = waypoint.pitch
  }, [])

  const flyToWaypoint = useCallback((waypoint: Waypoint) => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed()) return
    const Cesium = window.Cesium
    if (!Cesium) return

    setIsFlying(true)
    setActiveWaypoint(waypoint)

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        waypoint.longitude,
        waypoint.latitude,
        waypoint.height
      ),
      orientation: {
        heading: waypoint.heading,
        pitch: waypoint.pitch,
        roll: 0,
      },
      duration: 3.5,
      complete: () => {
        applyWaypointGuide(waypoint)
        setIsFlying(false)
      },
      cancel: () => setIsFlying(false),
    })
  }, [applyWaypointGuide])

  // Update time of day when slider changes
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || viewer.isDestroyed() || !window.Cesium) return
    const Cesium = window.Cesium

    // Punta Arenas is UTC-3 in summer (Chile Standard Time)
    const date = new Date()
    date.setUTCHours((timeOfDay + 3) % 24, 0, 0, 0)
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
  }, [timeOfDay])

  useEffect(() => {
    const viewer = viewerRef.current
    const Cesium = window.Cesium
    if (!viewer || viewer.isDestroyed() || !Cesium) return

    const tick = () => {
      const nextViewer = viewerRef.current
      const nextCesium = window.Cesium
      if (!nextViewer || nextViewer.isDestroyed() || !nextCesium) return

      if (!isFlying) {
        const activeGuide = (activeWaypoint ?? OVERVIEW_WAYPOINT)?.guide
        const cameraState = guidedCameraRef.current
        const guide = activeGuide ?? {
          hoverLongitudeRange: 0.08,
          hoverLatitudeRange: 0.06,
          headingRange: 0.4,
          pitchMin: -1.0,
          pitchMax: -0.12,
        }

        const targetLongitude =
          cameraState.baseLongitude + cameraState.hoverX * guide.hoverLongitudeRange
        const targetLatitude =
          cameraState.baseLatitude + cameraState.hoverY * guide.hoverLatitudeRange
        const targetHeading = clamp(
          cameraState.baseHeading +
            cameraState.headingOffset +
            cameraState.hoverX * HOVER_HEADING_INFLUENCE,
          cameraState.baseHeading - guide.headingRange,
          cameraState.baseHeading + guide.headingRange
        )
        const targetPitch = clamp(
          cameraState.basePitch +
            cameraState.pitchOffset +
            cameraState.hoverY * HOVER_PITCH_INFLUENCE,
          guide.pitchMin,
          guide.pitchMax
        )

        cameraState.currentLongitude +=
          (targetLongitude - cameraState.currentLongitude) * CAMERA_SMOOTHING
        cameraState.currentLatitude +=
          (targetLatitude - cameraState.currentLatitude) * CAMERA_SMOOTHING
        cameraState.currentHeading +=
          (targetHeading - cameraState.currentHeading) * CAMERA_SMOOTHING
        cameraState.currentPitch +=
          (targetPitch - cameraState.currentPitch) * CAMERA_SMOOTHING
        cameraState.currentHeight = cameraState.baseHeight

        nextViewer.camera.setView({
          destination: nextCesium.Cartesian3.fromDegrees(
            cameraState.currentLongitude,
            cameraState.currentLatitude,
            cameraState.currentHeight
          ),
          orientation: {
            heading: cameraState.currentHeading,
            pitch: cameraState.currentPitch,
            roll: 0,
          },
        })
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
  }, [activeWaypoint, isFlying, isLoaded])

  useEffect(() => {
    const tileset = googleTilesetRef.current
    if (!tileset) return
    tileset.show = photorealisticEnabled
  }, [photorealisticEnabled])

  const updateHoverFromPointer = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const normalizedX = ((clientX - rect.left) / rect.width) * 2 - 1
    const normalizedY = ((clientY - rect.top) / rect.height) * 2 - 1
    const cameraState = guidedCameraRef.current
    cameraState.hoverX = clamp(normalizedX, -1, 1)
    cameraState.hoverY = clamp(-normalizedY, -1, 1)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragStateRef.current.dragging = true
    dragStateRef.current.lastX = event.clientX
    dragStateRef.current.lastY = event.clientY
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    const activeGuide = (activeWaypoint ?? OVERVIEW_WAYPOINT)?.guide

    if (!dragState.dragging || !activeGuide) {
      updateHoverFromPointer(event.clientX, event.clientY)
      return
    }

    const dx = event.clientX - dragState.lastX
    const dy = event.clientY - dragState.lastY
    dragState.lastX = event.clientX
    dragState.lastY = event.clientY

    const cameraState = guidedCameraRef.current
    cameraState.headingOffset = clamp(
      cameraState.headingOffset + dx * DRAG_HEADING_SENSITIVITY,
      -activeGuide.headingRange,
      activeGuide.headingRange
    )
    const nextPitch = cameraState.basePitch + cameraState.pitchOffset + dy * DRAG_PITCH_SENSITIVITY
    cameraState.pitchOffset = clamp(nextPitch, activeGuide.pitchMin, activeGuide.pitchMax) - cameraState.basePitch
  }, [activeWaypoint, updateHoverFromPointer])

  const handlePointerUp = useCallback(() => {
    dragStateRef.current.dragging = false
  }, [])

  const handlePointerLeave = useCallback(() => {
    dragStateRef.current.dragging = false
    const cameraState = guidedCameraRef.current
    cameraState.hoverX = 0
    cameraState.hoverY = 0
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    let viewer: CesiumViewer | null = null

    const initCesium = async () => {
      const Cesium = await import('cesium')

      // Set base URL for Cesium workers and assets (must be before any Cesium calls)
      window.CESIUM_BASE_URL = `${window.location.origin}/_next/static/cesium/`
      Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN

      if (!containerRef.current) return

      const isMobile = window.innerWidth < 768

      // Base imagery — prefer ArcGIS World Imagery (real satellite texture)
      // and fall back to Natural Earth II if unavailable.
      let baseLayer: InstanceType<typeof Cesium.ImageryLayer>
      try {
        const arcGisProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        )
        baseLayer = new Cesium.ImageryLayer(arcGisProvider)
      } catch {
        const tmsProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
          Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
          { fileExtension: 'jpg' }
        )
        baseLayer = new Cesium.ImageryLayer(tmsProvider)
      }

      // High-res satellite overlay from Cesium Ion (requires valid token)
      let satelliteLayer: InstanceType<typeof Cesium.ImageryLayer> | null = null
      if (CESIUM_ION_TOKEN) {
        try {
          const satelliteProvider = await Cesium.IonImageryProvider.fromAssetId(2)
          satelliteLayer = new Cesium.ImageryLayer(satelliteProvider, { alpha: 1.0 })
        } catch {
          // Falls back to Natural Earth II — no crash
        }
      }

      // World terrain with water mask & normals for realistic shading
      let terrainProvider: InstanceType<typeof Cesium.TerrainProvider>
      try {
        terrainProvider = await Cesium.createWorldTerrainAsync({
          requestWaterMask: true,
          requestVertexNormals: true,
        })
      } catch (err) {
        console.warn('[CesiumExplorer] World terrain unavailable, using ellipsoid fallback.', err)
        terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }

      viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider,
        // Suppress the default Bing Maps auto-layer — we manage imagery ourselves
        baseLayer: false,
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'),
        msaaSamples: isMobile ? 1 : 4,
      })

      // Add imagery layers in order (base first, satellite on top)
      viewer.imageryLayers.add(baseLayer)
      if (satelliteLayer) viewer.imageryLayers.add(satelliteLayer)

      // Add 3D buildings for cities like Punta Arenas.
      try {
        const buildingsTileset = await Cesium.createOsmBuildingsAsync()
        viewer.scene.primitives.add(buildingsTileset)
      } catch (err) {
        console.warn('[CesiumExplorer] OSM Buildings unavailable.', err)
      }

      viewerRef.current = viewer
      window.Cesium = Cesium

      const cameraController = viewer.scene.screenSpaceCameraController
      cameraController.enableTranslate = false
      cameraController.enableRotate = false
      cameraController.enableTilt = false
      cameraController.enableLook = false
      cameraController.enableZoom = false

      // Terrain vertical exaggeration (Cesium 1.105+ API)
      viewer.scene.verticalExaggeration = isMobile ? 1.5 : TERRAIN_EXAGGERATION

      // ── Lighting ───────────────────────────────────────────────────────────
      // Patagonia summer afternoon: 14:00 local = 17:00 UTC (UTC-3).
      // Globe lighting is ON for sun/shadow realism but dynamic atmosphere
      // lighting is OFF so the viewing hemisphere stays consistently bright.
      viewer.scene.globe.enableLighting = true
      viewer.scene.globe.dynamicAtmosphereLighting = false
      viewer.scene.globe.atmosphereLightIntensity = 12.0
      viewer.scene.globe.atmosphereRayleighCoefficient = new Cesium.Cartesian3(
        5.5e-6, 13.0e-6, 28.4e-6
      )

      const initDate = new Date()
      initDate.setUTCHours(17, 0, 0, 0) // 14:00 local Punta Arenas
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(initDate)

      // Atmosphere & fog
      viewer.scene.atmosphere.brightnessShift = 0.45
      viewer.scene.atmosphere.hueShift = 0.0
      viewer.scene.atmosphere.saturationShift = 0.15
      viewer.scene.fog.enabled = true
      viewer.scene.fog.density = isMobile ? 0.0003 : 0.00015
      viewer.scene.fog.minimumBrightness = 0.35
      viewer.scene.globe.depthTestAgainstTerrain = true
      const skyBox = viewer.scene.skyBox as { show?: boolean } | undefined
      if (skyBox) skyBox.show = true
      const skyAtmosphere = viewer.scene.skyAtmosphere as { show?: boolean } | undefined
      if (skyAtmosphere) skyAtmosphere.show = true

      // Shadows
      viewer.shadows = !isMobile
      viewer.terrainShadows = isMobile
        ? Cesium.ShadowMode.DISABLED
        : Cesium.ShadowMode.ENABLED

      // Post-processing — light touch so we don't darken the scene
      viewer.scene.postProcessStages.fxaa.enabled = true

      if (!isMobile) {
        viewer.scene.postProcessStages.bloom.enabled = true
        viewer.scene.postProcessStages.bloom.uniforms.contrast = 80
        viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.1
        viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false
      }

      viewer.resolutionScale = isMobile ? 0.75 : 1.0

      addBoatAnimation(viewer, Cesium)
      addSiteMarkers(viewer, Cesium)

      try {
        const photorealisticTileset = await Cesium.createGooglePhotorealistic3DTileset()
        photorealisticTileset.show = true
        viewer.scene.primitives.add(photorealisticTileset)
        googleTilesetRef.current = photorealisticTileset
        setHasPhotorealisticLand(true)
      } catch (err) {
        console.warn('[CesiumExplorer] Google photorealistic tiles unavailable.', err)
        setHasPhotorealisticLand(false)
      }

      // Start with the overview cinematic frame.
      const startWaypoint = OVERVIEW_WAYPOINT ?? {
        longitude: PUNTA_ARENAS_START.longitude,
        latitude: PUNTA_ARENAS_START.latitude,
        height: PUNTA_ARENAS_START.height,
        heading: 0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        guide: {
          hoverLongitudeRange: 0.08,
          hoverLatitudeRange: 0.06,
          headingRange: 0.4,
          pitchMin: -1.0,
          pitchMax: -0.12,
        },
      }
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          startWaypoint.longitude,
          startWaypoint.latitude,
          startWaypoint.height
        ),
        orientation: {
          heading: startWaypoint.heading,
          pitch: startWaypoint.pitch,
          roll: 0,
        },
      })
      if (OVERVIEW_WAYPOINT) {
        applyWaypointGuide(OVERVIEW_WAYPOINT)
      }
      setIsLoaded(true)
    }

    // Safety: force-show viewer after 8 seconds regardless of fly-in status
    const safetyTimer = setTimeout(() => setIsLoaded(true), 8000)

    initCesium().catch((err) => {
      console.error('[CesiumExplorer] Init failed:', err)
      setIsLoaded(true) // show the (empty) viewer so the user isn't stuck
    })

    return () => {
      clearTimeout(safetyTimer)
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy()
      }
      googleTilesetRef.current = null
      viewerRef.current = null
      delete window.Cesium
    }
  }, [applyWaypointGuide])

  const backLabel: Record<string, string> = {
    en: '← Back to site',
    es: '← Volver al sitio',
    zh: '← 返回网站',
    fr: '← Retour au site',
  }

  const timeLabel: Record<string, string> = {
    en: 'Time',
    es: 'Hora',
    zh: '时间',
    fr: 'Heure',
  }

  const landLabel: Record<string, string> = {
    en: 'Realistic land',
    es: 'Tierra realista',
    zh: '真实地形',
    fr: 'Terres réalistes',
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: isLoaded ? '#0a0f1a' : '#ffffff',
      }}
    >
      {!isLoaded && (
        <ExploreLoadingSurface subtitle="Loading satellite terrain…" />
      )}

      {/* Cesium container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      />

      {/* Top bar */}
      {isLoaded && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,15,26,0.7) 0%, transparent 100%)',
          }}
        >
          <a
            href={`/${locale}`}
            className="pointer-events-auto text-white/60 hover:text-white text-xs tracking-wider transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault()
              push(`/${locale}`)
            }}
          >
            {backLabel[locale] ?? backLabel.en}
          </a>

          <span className="text-white/30 text-[11px] tracking-[0.3em] uppercase">
            Cabo Negro · Magallanes
          </span>

          {/* Time of day and land mode controls */}
          <div className="pointer-events-auto flex items-center gap-5">
            {hasPhotorealisticLand && (
              <label className="flex items-center gap-2">
                <span className="text-white/35 text-[10px] tracking-wider">
                  {landLabel[locale] ?? landLabel.en}
                </span>
                <button
                  type="button"
                  onClick={() => setPhotorealisticEnabled((prev) => !prev)}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                  style={{
                    background: photorealisticEnabled ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)',
                  }}
                  aria-label={landLabel[locale] ?? landLabel.en}
                  aria-pressed={photorealisticEnabled}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-[#0a0f1a] transition-transform duration-200"
                    style={{
                      transform: photorealisticEnabled ? 'translateX(18px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </label>
            )}

            <div className="flex items-center gap-3">
            <span className="text-white/35 text-[10px] tracking-wider">
              {timeLabel[locale] ?? timeLabel.en}
            </span>
            <input
              type="range"
              min={6}
              max={22}
              step={1}
              value={timeOfDay}
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
    </div>
  )
}
