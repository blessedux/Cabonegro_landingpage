# 3D Virtual Tour Experience - Implementation Guide

## Overview

The Cabo Negro landing page features an interactive 3D virtual tour experience built with React Three Fiber (R3F) and Three.js. The experience provides an immersive exploration of the Cabo Negro area in Patagonia, Chile, featuring realistic terrain, water, industrial models, and interactive camera controls.

## Architecture

### Main Entry Point

**File**: `src/components/scenes/Experience3D.tsx`

The main scene container that orchestrates all 3D components:

- **Canvas Setup**: React Three Fiber Canvas with adaptive quality settings
- **Mobile Detection**: Automatically adjusts quality for mobile devices
- **Scene Management**: Manages scene transitions (initial → satellite-view → satellite-orbit → ground-level)
- **Component Integration**: Combines terrain, water, buildings, industrial models, and UI overlays

### Key Components

#### 1. Terrain System

**File**: `src/components/scenes/TerrainGLBWithHeightmap.tsx`

- **GLB Model**: Uses `/assets/models/terrain-tiles.glb` for terrain mesh and texture
- **Heightmap**: Applies elevation data from `/assets/terrain/punta-arenas-cabonegro-heightmap.png`
- **Adaptive Quality**: Loads different texture resolutions based on device performance:
  - Low: `terrain-texture-low.png`
  - Medium: `terrain-texture-medium.png`
  - Ultra: `terrain-texture-ultra.png`
- **Displacement**: Applies heightmap data to create realistic terrain elevation (1500x exaggeration)
- **Size**: 80km diameter (40km radius) centered on Cabo Negro

#### 2. Water System

**File**: `src/components/scenes/Water.tsx`

- **Animated Shader**: Custom shader material with realistic ocean wave patterns
- **Multiple Wave Layers**: Combines large, medium, and small waves for realistic movement
- **Visual Effects**: Foam on wave peaks, depth-based color gradients
- **Performance**: Low-poly geometry with configurable segments

#### 3. Camera Controls

**File**: `src/components/scenes/CameraControls.tsx`

- **Free Flight Mode**: FPS-style controls with WASD/Arrow keys for movement
- **Guided Tour**: Predefined waypoints with smooth GSAP animations
- **Mouse Look**: Pointer lock for first-person camera rotation
- **Terrain Following**: Automatically adjusts height above terrain using raycasting
- **Height Limits**: 100m minimum to 40km maximum altitude
- **Keyboard Shortcuts**:
  - Space: Toggle free flight / guided tour
  - Arrow Keys / WASD: Movement
  - Mouse: Look around (when pointer locked)

#### 4. Scene Sequence Controller

**File**: `src/components/scenes/SceneSequenceController.tsx`

- **Automatic Transitions**: Manages scene progression through different views
- **Scene Types**:
  - `initial`: Starting view
  - `satellite-view`: High altitude overview
  - `satellite-orbit`: Orbital camera around target point
  - `ground-level`: Close-up exploration
- **Timing**: Configurable scene duration (default: 8 seconds)
- **Auto-advance**: Optional automatic progression between scenes

#### 5. Satellite Orbit Camera

**File**: `src/components/scenes/SatelliteOrbitCamera.tsx`

- **Orbital Motion**: Smooth circular orbit around target coordinates
- **Target**: Focuses on laser marker location (52°56'13.7"S 70°50'58.7"W)
- **Altitude**: 50km above ground
- **Orbital Radius**: 20km from target
- **Speed**: Configurable orbital speed

#### 6. Story Overlay

**File**: `src/components/scenes/StoryOverlay.tsx`

- **Proximity-Based**: Displays information when camera approaches story points
- **HTML Overlays**: Uses React portals to render HTML content over 3D scene
- **Smooth Transitions**: Fade in/out animations
- **Story Points**: Configurable points of interest with titles and descriptions

#### 7. Minimap

**File**: `src/components/scenes/Minimap.tsx`

- **2D Overview**: Top-down view of the terrain
- **Camera Indicator**: Shows current camera position and orientation
- **Interactive**: Click to navigate to different areas
- **Fixed UI**: Overlay component outside Canvas

#### 8. Camera Waypoints

**File**: `src/components/scenes/CameraWaypoints.tsx`

- **Predefined Locations**: Set of key locations to visit
- **UI Controls**: Buttons to navigate between waypoints
- **Smooth Transitions**: GSAP animations between waypoints

#### 9. Buildings

**File**: `src/components/scenes/Buildings.tsx`

- **GLTF Support**: Can load 3D building models
- **Placeholder Models**: Simple geometric buildings when models unavailable
- **Terrain Snapping**: Automatically positions buildings on terrain using raycasting
- **Lat/Lng Positioning**: Places buildings based on geographic coordinates

#### 10. Industrial Models

**File**: `src/components/scenes/IndustrialModels.tsx`

- **Procedural Models**: Generates 3D models programmatically
- **Model Types**:
  - Shipyard: Construction site with cranes
  - Vessels: Ship hulls
  - Wind Turbines: Wind farm installations
  - Data Centers: Storage facility buildings
- **Geographic Placement**: Positions models based on lat/lng coordinates
- **Terrain Snapping**: Ensures models sit correctly on terrain

#### 11. Laser Marker

**File**: `src/components/scenes/LaserMarker.tsx`

- **Visual Indicator**: Green laser beam marking specific coordinates
- **Pulsing Animation**: Animated beam effect
- **Target Location**: 52°56'13.7"S 70°50'58.7"W
- **Height**: 5000m beam

#### 12. Background Image

**File**: `src/components/scenes/BackgroundImage.tsx`

- **Infinite Sky**: Background image for void space
- **Blur Effect**: Configurable blur for depth
- **Image**: `/PCORL3V6UJHZPEXYERJXVDM7UQ.webp`

## Assets

### Terrain Assets

- **GLB Model**: `/assets/models/terrain-tiles.glb` - Terrain mesh with embedded texture
- **Heightmap**: `/assets/terrain/punta-arenas-cabonegro-heightmap.png` - 1024×1024 elevation data
- **Textures**:
  - Low: `/assets/terrain/terrain-texture-low.png`
  - Medium: `/assets/terrain/terrain-texture-medium.png`
  - Ultra: `/assets/terrain/terrain-texture-ultra.png`

### Coordinate System

**File**: `src/lib/terrain/coordinates.ts`

- **Center Point**: 53°03'40.4"S 70°52'42.2"W (-53.061222, -70.878388)
- **Terrain Size**: 80km diameter (40km radius)
- **Coordinate Conversion**: Utilities to convert between lat/lng and 3D world coordinates
- **Key Locations**: Predefined waypoints and industrial facility locations

## Features

### Interactive Navigation

1. **Free Flight Mode**:
   - WASD/Arrow keys for movement
   - Mouse for camera rotation (when pointer locked)
   - Space to toggle between free flight and guided tour

2. **Guided Tour**:
   - Predefined waypoints with smooth camera transitions
   - Automatic progression through key locations
   - UI controls to navigate between waypoints

3. **Scene Sequences**:
   - Automatic transitions between different view modes
   - Satellite orbit around target location
   - Smooth camera animations using GSAP

### Visual Elements

1. **Realistic Terrain**:
   - Satellite imagery texture
   - Heightmap-based elevation
   - 1500x height exaggeration for visibility

2. **Animated Water**:
   - Realistic ocean wave patterns
   - Multiple wave layers
   - Foam and depth effects

3. **Industrial Models**:
   - Procedurally generated 3D models
   - Shipyard, vessels, wind turbines, data centers
   - Positioned at real geographic coordinates

4. **Story Points**:
   - Proximity-based information overlays
   - Smooth fade in/out animations
   - Customizable content

### Performance Optimizations

1. **Adaptive Quality**:
   - Mobile devices: Lower DPR, no antialiasing, reduced segments
   - Desktop: Higher quality settings
   - Automatic texture quality selection

2. **LOD System**:
   - Multiple texture resolutions
   - Automatic fallback to lower quality if needed

3. **Efficient Rendering**:
   - Low-poly water geometry
   - Optimized terrain segments
   - Performance monitoring (dev mode)

4. **Loading States**:
   - Suspense boundaries for async loading
   - Loading state tracking
   - Error boundaries for graceful error handling

## Controls Reference

### Keyboard

- **W / ↑**: Move forward
- **S / ↓**: Move backward
- **A / ←**: Move left
- **D / →**: Move right
- **Space**: Toggle free flight / guided tour
- **Q**: Move up (in free flight)
- **E**: Move down (in free flight)

### Mouse

- **Click + Drag**: Rotate camera (when pointer locked)
- **Scroll**: Zoom (if enabled)

### UI Controls

- **Minimap**: Click to navigate
- **Waypoint Buttons**: Navigate to predefined locations
- **Story Overlay**: Appears automatically when near story points

## Technical Details

### React Three Fiber Integration

- Uses `@react-three/fiber` for React-based 3D rendering
- Uses `@react-three/drei` for helpers and utilities
- Canvas configured with adaptive DPR and performance settings

### State Management

- **Camera State Context**: `src/contexts/CameraStateContext.tsx` - Global camera state
- **Window Globals**: Some components use window object for cross-component communication

### Animation

- **GSAP**: Used for smooth camera transitions and animations
- **useFrame**: React Three Fiber hook for frame-based updates
- **Shader Animations**: Custom shaders for water and effects

### Coordinate System

- **World Space**: Meters, centered at terrain center
- **Geographic**: Latitude/longitude for real-world locations
- **Conversion**: Utilities in `coordinates.ts` handle conversions

## Development Tools

### Debug Components (Dev Only)

- **TerrainDebug**: Visual debugging for terrain
- **TerrainVerification**: Verifies terrain loading
- **HeightmapTest**: Tests heightmap accessibility
- **TerrainStatus**: Status indicator for terrain loading
- **PerformanceMonitor**: FPS and performance metrics

### Error Handling

- **Error Boundaries**: Graceful error handling
- **Fallbacks**: Automatic fallback to lower quality assets
- **Loading States**: Clear loading indicators

## File Structure

```
src/
├── components/
│   └── scenes/
│       ├── Experience3D.tsx          # Main scene container
│       ├── TerrainGLBWithHeightmap.tsx
│       ├── Water.tsx
│       ├── CameraControls.tsx
│       ├── SceneSequenceController.tsx
│       ├── SatelliteOrbitCamera.tsx
│       ├── StoryOverlay.tsx
│       ├── Minimap.tsx
│       ├── CameraWaypoints.tsx
│       ├── Buildings.tsx
│       ├── IndustrialModels.tsx
│       ├── LaserMarker.tsx
│       ├── BackgroundImage.tsx
│       └── [debug components]
├── lib/
│   └── terrain/
│       └── coordinates.ts            # Coordinate utilities
└── contexts/
    └── CameraStateContext.tsx        # Camera state management
```

## Configuration

### Quality Settings

Adaptive quality is configured in `Experience3D.tsx`:

```typescript
const qualitySettings = {
  mobile: {
    dpr: [1, 1.5],
    antialias: false,
    segments: 128,
    waterSegments: 32,
  },
  desktop: {
    dpr: [1, 2],
    antialias: true,
    segments: 256,
    waterSegments: 64,
  },
};
```

### Terrain Configuration

- **Size**: 80km (TERRAIN_SIZE constant)
- **Center**: -53.061222, -70.878388
- **Height Scale**: 1500x exaggeration
- **Segments**: 256 (desktop), 128 (mobile)

## Future Enhancements

Potential improvements:

1. **More Industrial Models**: Additional facility types
2. **Enhanced Story Points**: More interactive content
3. **VR Support**: Virtual reality exploration
4. **Multiplayer**: Shared exploration experience
5. **Weather Effects**: Dynamic weather and time of day
6. **More Waypoints**: Expanded tour locations

## Troubleshooting

### Terrain Not Loading

- Check that GLB and heightmap files exist in `/public/assets/`
- Verify texture files are accessible
- Check browser console for loading errors

### Performance Issues

- Reduce terrain segments in quality settings
- Lower texture quality
- Disable antialiasing on mobile
- Check PerformanceMonitor for bottlenecks

### Camera Controls Not Working

- Ensure pointer lock is enabled (click on canvas first)
- Check that CameraControls component is rendered
- Verify camera state context is properly initialized
