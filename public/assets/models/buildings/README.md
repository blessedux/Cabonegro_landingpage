# Building Models

## GLTF Model Requirements

Place low-poly 3D building models here for future project visualization.

### Specifications:

- **Format**: GLTF or GLB
- **Poly Count**: Low-poly (< 5k triangles per building)
- **Textures**: Embedded or separate (prefer embedded for simplicity)
- **Optimization**: Use gltfpack to compress models

### Sources:

- **Free Models**: poly.pizza, Sketchfab (CC0 license)
- **Custom**: Create in Blender and export as GLTF

### File Structure:

```
buildings/
  ├── building-main.gltf
  ├── building-warehouse.gltf
  └── building-office.gltf
```

### Usage:

Models are loaded in `Buildings.tsx` component. Update the `DEFAULT_BUILDINGS` array with model paths:

```typescript
{
  lat: -52.937139,
  lng: -70.849639,
  modelUrl: '/assets/models/buildings/building-main.gltf',
  scale: 1,
  rotation: 0,
  name: 'Main Terminal'
}
```

### Placeholder:

If no models are provided, the system will use simple geometric placeholders (boxes with roofs).
