# Convert 90k Tiles to GLB

This script converts all your PNG tiles into a single optimized GLB file that can be used in 3D applications.

## Quick Start

1. **Create a virtual environment (recommended):**

   ```bash
   python3 -m venv venv
   ./venv/bin/pip install pygltflib Pillow numpy
   ```

   Or install globally (may require `--break-system-packages` on macOS):

   ```bash
   pip3 install pygltflib Pillow numpy
   ```

2. **Run the conversion:**

   ```bash
   # Using virtual environment:
   ./venv/bin/python scripts/tiles-to-glb.py
   
   # Or using system Python:
   python3 scripts/tiles-to-glb.py
   ```

   Or with a quality preset:

   ```bash
   python scripts/tiles-to-glb.py high    # Default: 8k texture
   python scripts/tiles-to-glb.py ultra   # Best quality: 16k texture
   python scripts/tiles-to-glb.py medium  # Medium: 4k texture
   python scripts/tiles-to-glb.py low     # Low: 2k texture
   ```

## Quality Presets

- **ultra**: 16k texture, no compression (best quality, largest file)
- **high**: 8k texture, light compression (recommended, good balance)
- **medium**: 4k texture, medium compression (smaller file, good for web)
- **low**: 2k texture, high compression (smallest file, lower quality)

## Output Files

The script creates:

- `public/assets/models/terrain-tiles.glb` - The 3D model file
- `public/assets/models/terrain-texture.png` - The texture atlas (for reference)
- `public/assets/models/terrain-metadata.json` - Metadata about the conversion

## How It Works

1. **Scans** all PNG tiles in `public/assets/tiles/`
2. **Calculates** the optimal texture atlas size based on tile bounds
3. **Composites** all tiles into a single texture atlas
4. **Creates** a 3D plane mesh with the texture applied
5. **Exports** as GLB format (binary GLTF)

## Performance Notes

- For 90k tiles, the script processes in batches to manage memory
- Large tile sets will be automatically scaled down to fit GPU limits
- Processing time depends on number of tiles (expect 5-15 minutes for 90k tiles)
- The script shows progress every 1000 tiles

## Troubleshooting

**Out of memory errors:**

- Use a lower quality preset (medium or low)
- The script processes in batches, but very large textures can still be memory-intensive

**Missing tiles:**

- The script will continue if some tiles are missing
- Check the console output for warnings about failed tiles

**Texture too large:**

- The script automatically scales down if needed
- Use a lower quality preset to force smaller textures

## Using the GLB File

The generated GLB file can be:

- Loaded in Three.js: `import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'`
- Opened in Blender, Maya, or other 3D software
- Used in Unity, Unreal Engine, or other game engines
- Displayed in web viewers like model-viewer

## Example Usage in Three.js

```javascript
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("/assets/models/terrain-tiles.glb", (gltf) => {
  scene.add(gltf.scene);
});
```
