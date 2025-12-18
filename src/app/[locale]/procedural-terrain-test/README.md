# Procedural Terrain Test Page

This page implements the Three.js WebGPU procedural terrain example from the original code.

## Requirements

1. **Three.js with WebGPU and TSL support**

   - Requires Three.js r150+ with WebGPU renderer
   - TSL (Three.js Shading Language) support
   - Install: `npm install three@latest` or use a CDN version with WebGPU support

2. **WebGPU-enabled browser**
   - Chrome 113+
   - Edge 113+
   - Safari 16.4+

## Implementation Notes

The original code uses:

- `three/webgpu` - WebGPU renderer
- `three/tsl` - Three.js Shading Language (TSL) for node materials
- `three/addons/` - Various Three.js addons (OrbitControls, HDRLoader, Inspector)

The full implementation includes:

- Procedural terrain generation using TSL shader nodes
- Noise-based elevation
- Dynamic color mixing (sand, grass, rock, snow)
- Interactive dragging to offset terrain
- HDR environment mapping
- Water plane with physical material

## Access

Visit: `/[locale]/procedural-terrain-test`

For example:

- `/en/procedural-terrain-test`
- `/es/procedural-terrain-test`

## Original Code Reference

The original HTML code is preserved in the component comments. To fully implement, you'll need to:

1. Ensure Three.js includes WebGPU and TSL support
2. Import TSL functions: `mx_noise_float`, `color`, `cross`, `dot`, `float`, `transformNormalToView`, `positionLocal`, `sign`, `step`, `Fn`, `uniform`, `varying`, `vec2`, `vec3`, `Loop`
3. Use `MeshStandardNodeMaterial` instead of `MeshStandardMaterial`
4. Implement the terrain elevation function using TSL
5. Set up `positionNode`, `normalNode`, and `colorNode` using TSL functions
