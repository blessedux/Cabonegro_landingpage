# 3D Map Performance Optimizations

## Overview

This document outlines the performance optimizations implemented for the 3D map experience at `/[locale]/map`.

## Bundle Size Optimizations

### Code Splitting

- **Dynamic Imports**: All 3D scene components are loaded dynamically with `next/dynamic` and `ssr: false`
- **Lazy Loading**: Terrain, Water, Buildings, and other scene components load on-demand
- **Target**: Keep 3D map bundle under 5MB total

### Package Optimizations

- Added `@react-three/fiber` and `@react-three/drei` to `optimizePackageImports` in `next.config.js`
- Tree-shaking enabled for Three.js imports
- Only import necessary drei utilities

## Runtime Performance

### Adaptive Quality

- **Desktop**:
  - DPR: [1, 2]
  - Antialiasing: Enabled
  - Terrain segments: 256
  - Water segments: 64
- **Mobile**:
  - DPR: [1, 1.5]
  - Antialiasing: Disabled
  - Terrain segments: 128
  - Water segments: 32
  - Environment preset: Disabled

### Level of Detail (LOD)

- **Terrain**: 3 LOD levels
  - High detail (0-500m): 256 segments
  - Medium detail (500-1000m): 128 segments
  - Low detail (1000m+): 64 segments
- Automatic switching based on camera distance

### Rendering Optimizations

- **Frustum Culling**: Enabled on all meshes
- **Shadow Optimization**: Receive shadows only where needed
- **Texture Compression**:
  - Heightmap: Max 1024x1024
  - Terrain textures: 512x512 max
  - Water noise: 256x256 max

### Geometry Optimization

- **Terrain**: Uses BufferGeometry
- **Water**: Low-poly plane (~4k vertices at 64 segments)
- **Buildings**: Placeholder geometry or optimized GLTF models

## Mobile Optimizations

### Performance Targets

- **Frame Rate**: 30+ FPS on modern mobile devices
- **Initial Load**: <5 seconds on 4G
- **Bundle Size**: Reduced by ~40% on mobile

### Implemented Features

1. **Reduced Geometry Complexity**

   - Lower segment counts for terrain and water
   - Simplified shader calculations

2. **Disabled Expensive Features**

   - Antialiasing disabled
   - Environment preset disabled
   - Lower DPR

3. **Adaptive Loading**
   - Progressive asset loading
   - Fallback to simpler geometries

## Loading Strategy

### Progressive Loading

1. **Phase 1**: Terrain (critical, loads first)
2. **Phase 2**: Water (secondary)
3. **Phase 3**: Buildings (tertiary, can be delayed)

### Loading States

- Loading screen with spinner
- Suspense boundaries for each component
- Error boundaries for graceful fallbacks

## Asset Optimization

### Heightmap

- Format: PNG (grayscale)
- Resolution: 1024x1024 (can be reduced to 512x512 for mobile)
- Compression: Lossless PNG or compressed if needed

### 3D Models

- Format: GLTF/GLB (prefer GLB for single file)
- Optimization: Use gltfpack to compress
- Poly count: <5k triangles per building
- Textures: Embedded or compressed

### Textures

- Terrain diffuse: 512x512 max
- Water noise: 256x256 max
- Use WebP format when possible

## Performance Monitoring

### Metrics to Track

1. **Frame Rate**: Target 60 FPS desktop, 30+ FPS mobile
2. **Bundle Size**: Monitor with `npm run analyze`
3. **Load Time**: Track initial scene load
4. **Memory Usage**: Monitor for memory leaks

### Tools

- Chrome DevTools Performance tab
- React DevTools Profiler
- Next.js Bundle Analyzer (`ANALYZE=true npm run build`)

## Future Optimizations

### Potential Improvements

1. **Chunk Loading**: Load terrain chunks based on camera position
2. **Instanced Rendering**: Use for repeated building elements
3. **Texture Atlasing**: Combine multiple textures
4. **Occlusion Culling**: Hide objects behind terrain
5. **Web Workers**: Offload heightmap processing
6. **Service Worker**: Cache assets for faster reloads

## Testing Checklist

- [ ] Desktop: 60 FPS maintained
- [ ] Mobile: 30+ FPS maintained
- [ ] Bundle size under 5MB
- [ ] Initial load under 3 seconds (fast connection)
- [ ] No memory leaks during extended use
- [ ] Smooth LOD transitions
- [ ] Graceful degradation on low-end devices
