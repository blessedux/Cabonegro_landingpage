'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useState, useEffect } from 'react'
import Terrain from './Terrain'
import InfiniteTerrain from './InfiniteTerrain'
import RealTerrain from './RealTerrain'
import TerrainGLBWithHeightmap from './TerrainGLBWithHeightmap'
import Water from './Water'
import Buildings from './Buildings'
import CameraControls from './CameraControls'
import StoryOverlay, { StoryOverlayController } from './StoryOverlay'
import PerformanceMonitor from './PerformanceMonitor'
import TerrainDebug from './TerrainDebug'
import HeightmapTest from './HeightmapTest'
import TerrainStatus from './TerrainStatus'
import SimpleTestTerrain from './SimpleTestTerrain'
import TerrainVerification from './TerrainVerification'
import Minimap, { MinimapController } from './Minimap'
import BackgroundImage from './BackgroundImage'
import LaserMarker from './LaserMarker'
import CameraWaypoints, { CameraWaypointController } from './CameraWaypoints'
import IndustrialModels from './IndustrialModels'
import { LoadingStateTracker } from './LoadingStateTracker'
// import TerrainGLB from './TerrainGLB' // Disabled - causing material uniform errors

export default function Experience3D() {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
  }, [])

  // Adaptive quality settings based on device
  const qualitySettings = useMemo(() => {
    if (isMobile) {
      return {
        dpr: [1, 1.5], // Lower DPR on mobile
        antialias: false, // Disable antialiasing on mobile for performance
        segments: 128, // Lower terrain segments
        waterSegments: 32, // Lower water segments
      }
    }
    return {
      dpr: [1, 2],
      antialias: true,
      segments: 256,
      waterSegments: 64,
    }
  }, [])

  return (
    <>
      <Canvas
        gl={{ 
          antialias: qualitySettings.antialias, 
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false, // Better performance
        }}
        dpr={qualitySettings.dpr as [number, number]}
        performance={{ min: 0.5 }} // Adaptive performance
        camera={{ 
          position: [0, 2000, 0], // Start at center, 2000m above ground to see more area
          fov: 75, // Wider FOV to see more area
          near: 0.1,
          far: 150000 // Increased for 80km terrain (40km radius)
        }}
        frameloop="always" // Keep rendering active
        style={{ background: '#000000' }} // Black background (will be filled by BackgroundImage component)
      >
        <Suspense fallback={null}>
          {/* Neutral lighting for greyscale elevation visualization */}
          <ambientLight intensity={0.6} /> {/* Soft ambient light */}
          
          {/* Main directional light for elevation definition */}
          <directionalLight 
            position={[50, 100, 50]} 
            intensity={0.8} 
            castShadow={true}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Fill light for softer shadows */}
          <directionalLight position={[-30, 50, -30]} intensity={0.3} />
          
          {/* Hemisphere light - natural colors */}
          <hemisphereLight 
            args={[0x87CEEB, 0x4a5c3a, 0.5]} // Sky blue, earth brown
          />
          
          {/* Fog removed for clear visibility of terrain and coastline */}
          
          {/* Background image for infinite void */}
          <BackgroundImage imageUrl="/PCORL3V6UJHZPEXYERJXVDM7UQ.webp" blur={15} />
          
          {/* Scene Components */}
          {/* GLB terrain with correct texture and heightmap for proper elevation */}
          <TerrainGLBWithHeightmap 
            glbUrl="/assets/models/terrain-tiles.glb"
            heightmapUrl="/assets/terrain/punta-arenas-cabonegro-heightmap.png"
            heightScale={1500}
            segments={256}
          />
          
          {/* Water - re-enabled to show coastline */}
          <Water segments={qualitySettings.waterSegments} heightScale={1500} />
          
          {/* Test terrain - disabled now that real terrain is working */}
          {/* <SimpleTestTerrain /> */}
          {/* Temporarily disable water to see terrain */}
          {/* <Water segments={qualitySettings.waterSegments} /> */}
          <Buildings />
          
          {/* Industrial models - shipyard, vessels, wind turbines, data centers */}
          <IndustrialModels />
          
          {/* Laser marker at specified coordinates: 52°56'13.7"S 70°50'58.7"W */}
          <LaserMarker 
            lat={-52.937139} // 52°56'13.7"S = -52 - 56/60 - 13.7/3600
            lng={-70.849639} // 70°50'58.7"W = -70 - 50/60 - 58.7/3600
            height={5000}
            color="#00ff00"
            pulseSpeed={2}
          />
          
          {/* Controls */}
          <CameraControls />
          
          {/* Story Overlay Controller (inside Canvas for R3F hooks) */}
          <StoryOverlayController />
          
          {/* Minimap Controller (inside Canvas for R3F hooks) */}
          <MinimapController />
          
          {/* Camera Waypoint Controller (inside Canvas for R3F hooks) */}
          <CameraWaypointController />
          
          {/* Loading State Tracker */}
          <LoadingStateTracker />
          
          {/* Performance Monitoring (dev only) */}
          <PerformanceMonitor 
            enabled={process.env.NODE_ENV === 'development'}
            logToConsole={false}
          />
          
          {/* Debug component (dev only) */}
          {process.env.NODE_ENV === 'development' && <TerrainDebug />}
          
          {/* Terrain verification (dev only) */}
          {process.env.NODE_ENV === 'development' && <TerrainVerification />}
        </Suspense>
      </Canvas>
      
      {/* UI Overlays (outside Canvas, renders HTML via portals) */}
      <StoryOverlay />
      
      {/* Minimap (outside Canvas, fixed UI overlay) */}
      <Minimap />
      
      {/* Camera Waypoints UI (outside Canvas, fixed UI overlay) */}
      <CameraWaypoints />
      
      {/* Heightmap accessibility test (dev only) */}
      {process.env.NODE_ENV === 'development' && <HeightmapTest />}
      
      {/* Terrain status indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && <TerrainStatus />}
    </>
  )
}
