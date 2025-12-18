# Adaptive Quality System

The adaptive quality system automatically selects the appropriate terrain texture quality based on network conditions and performance metrics.

## Overview

The system uses three quality levels:

- **Low**: 2,048×2,048 pixels (3.2 MB) - Fast loading, lower quality
- **Medium**: 4,096×4,096 pixels (12.8 MB) - Balanced quality/performance
- **Ultra**: 16,384×16,384 pixels (187 MB) - Best quality, requires good network

## How It Works

### 1. Initial Load

- Always starts with **low quality** for fastest initial load
- Ensures the scene is visible quickly even on slow connections

### 2. Network Detection

The system monitors:

- **Bandwidth** (Mbps) - Connection speed
- **Latency** (ms) - Network delay
- **Connection type** - WiFi, 4G, 5G, etc.

### 3. Performance Monitoring

The system tracks:

- **FPS** - Frames per second
- **Frame time** - Time per frame in milliseconds
- **Load time** - Time to load textures

### 4. Quality Upgrades

Upgrades from low → medium → ultra when:

- Network bandwidth is sufficient
- Latency is low
- Performance metrics are good
- Load times are acceptable

### 5. Quality Downgrades

Downgrades from ultra → medium → low when:

- FPS drops below threshold
- Frame time exceeds limits
- Texture load times out
- Network conditions deteriorate

## Thresholds

### Ultra Quality Requirements

- Bandwidth: ≥ 10 Mbps
- Latency: ≤ 100 ms
- FPS: ≥ 50
- Frame time: ≤ 20 ms

### Medium Quality Requirements

- Bandwidth: ≥ 3 Mbps
- Latency: ≤ 200 ms
- FPS: ≥ 30
- Frame time: ≤ 33 ms

### Low Quality

- Default fallback
- Used when conditions don't meet medium/ultra requirements

## Usage

### Basic Usage

```tsx
import AdaptiveTerrainTexture from "@/components/scenes/AdaptiveTerrainTexture";

// In your scene
<AdaptiveTerrainTexture
  position={[0, 0, 0]}
  receiveShadow={true}
  castShadow={false}
/>;
```

### With Custom Scale

```tsx
<AdaptiveTerrainTexture
  position={[0, 0, 0]}
  scale={[40000, 1, 40000]}
  rotation={[-Math.PI / 2, 0, 0]}
/>
```

## Components

### `useAdaptiveQuality` Hook

Custom hook that monitors network and performance metrics:

```tsx
import { useAdaptiveQuality } from "@/hooks/useAdaptiveQuality";

const { quality, networkMetrics, performanceMetrics } = useAdaptiveQuality();
```

Returns:

- `quality`: Current quality level ('low' | 'medium' | 'ultra')
- `networkMetrics`: Network information (bandwidth, latency, etc.)
- `performanceMetrics`: Performance data (FPS, frame time, load time)
- `canUpgrade`: Whether quality can be upgraded
- `shouldDowngrade`: Whether quality should be downgraded

### `AdaptiveTerrainTexture` Component

React Three Fiber component that loads and displays terrain texture with adaptive quality.

**Props:**

- `position?: [number, number, number]` - Position in 3D space
- `scale?: number | [number, number, number]` - Scale factor(s)
- `rotation?: [number, number, number]` - Rotation in radians
- `receiveShadow?: boolean` - Whether to receive shadows
- `castShadow?: boolean` - Whether to cast shadows

## Network API Support

The system uses the [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) when available. For browsers that don't support it, the system falls back to manual bandwidth measurement.

## Performance Considerations

- Textures are loaded asynchronously
- Old textures are disposed when upgrading
- Load timeouts prevent indefinite waiting
- Automatic downgrade on errors or timeouts
- Smooth transitions between quality levels

## Files

- `/src/hooks/useAdaptiveQuality.ts` - Quality detection hook
- `/src/components/scenes/AdaptiveTerrainTexture.tsx` - Adaptive terrain component
- `/public/assets/terrain/terrain-texture-low.png` - Low quality texture
- `/public/assets/terrain/terrain-texture-medium.png` - Medium quality texture
- `/public/assets/terrain/terrain-texture-ultra.png` - Ultra quality texture

## Integration Example

To replace existing terrain with adaptive quality:

```tsx
// Before
<TerrainGLB url="/assets/models/terrain-tiles.glb" />

// After
<AdaptiveTerrainTexture />
```

The adaptive component will automatically:

1. Start with low quality
2. Monitor network and performance
3. Upgrade when conditions allow
4. Downgrade if performance suffers
