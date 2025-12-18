# Building Models

## Current Status

The Buildings component is configured to use placeholder geometric shapes (boxes with roofs) when no GLTF models are provided.

## To Add Real Building Models

1. **Source Models:**

   - **Free Models:** [poly.pizza](https://poly.pizza), [Sketchfab](https://sketchfab.com) (filter by CC0 license)
   - **Custom:** Create in Blender and export as GLTF

2. **Model Requirements:**

   - Format: GLTF or GLB
   - Poly Count: Low-poly (< 5k triangles per building)
   - Textures: Embedded or separate (prefer embedded)
   - Optimization: Use [gltfpack](https://github.com/zeux/meshoptimizer) to compress

3. **File Structure:**

   ```
   public/assets/models/buildings/
     ├── building-main.gltf
     ├── building-warehouse.gltf
     └── building-office.gltf
   ```

4. **Update Configuration:**
   Edit `src/components/scenes/Buildings.tsx` and update the `DEFAULT_BUILDINGS` array:

   ```typescript
   const DEFAULT_BUILDINGS: BuildingPosition[] = [
     {
       lat: -52.937139,
       lng: -70.849639,
       modelUrl: "/assets/models/buildings/building-main.gltf",
       scale: 1,
       rotation: 0,
       name: "Main Terminal",
     },
     // Add more buildings...
   ];
   ```

5. **Placement:**
   - Buildings are automatically positioned using lat/lng coordinates
   - They will be raycast to terrain for proper height placement
   - No manual positioning needed

## Placeholder Behavior

If no `modelUrl` is provided, the system uses simple geometric placeholders:

- Box geometry for building body
- Cone geometry for roof
- Automatically positioned and scaled
