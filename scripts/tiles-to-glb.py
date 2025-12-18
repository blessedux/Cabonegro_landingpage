#!/usr/bin/env python3
"""
Convert 90k tiles into a single optimized GLB file

This script:
1. Loads all PNG tiles from public/assets/tiles/
2. Composites them into a texture atlas (with smart tiling if needed)
3. Creates a 3D plane mesh with the texture
4. Exports as optimized GLB file using pygltflib
"""

import os
import re
import json
import math
from pathlib import Path
from typing import List, Tuple, Dict, Optional

try:
    import pygltflib
    from pygltflib import GLTF2, Scene, Node, Mesh, Primitive, Attributes, Buffer, BufferView, Accessor, Image as GLTFImage, Texture, Material, PbrMetallicRoughness
    from PIL import Image
    import numpy as np
except ImportError as e:
    print("❌ Missing required packages.")
    print(f"   Error: {e}")
    print("   Install with: pip install pygltflib pillow numpy")
    print("   Or use the virtual environment: ./venv/bin/pip install pygltflib pillow numpy")
    exit(1)

# Configuration
TILES_DIR = Path(__file__).parent.parent / "public" / "assets" / "tiles"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets" / "models"
TERRAIN_DIR = Path(__file__).parent.parent / "public" / "assets" / "terrain"
OUTPUT_FILE = OUTPUT_DIR / "terrain-tiles.glb"

# Tile configuration
TILE_SIZE = 256  # Each tile is 256x256 pixels
MAX_TEXTURE_SIZE = 16384  # Maximum texture size (16k for most GPUs, but 8k is safer)
SAFE_TEXTURE_SIZE = 8192  # Safer limit for most GPUs
BATCH_SIZE = 1000  # Process tiles in batches

# Quality presets
QUALITY_PRESETS = {
    'ultra': {'max_size': 16384, 'compression': 0},
    'high': {'max_size': 8192, 'compression': 1},
    'medium': {'max_size': 4096, 'compression': 6},
    'low': {'max_size': 2048, 'compression': 9}
}

def parse_tile_filename(filename: str) -> Optional[Dict]:
    """Parse tile filename: {zoom}_{x}_{y}.png"""
    match = re.match(r'^(\d+)_(\d+)_(\d+)\.png$', filename)
    if not match:
        return None
    return {
        'zoom': int(match.group(1)),
        'x': int(match.group(2)),
        'y': int(match.group(3)),
        'filename': filename
    }

def get_all_tiles() -> List[Dict]:
    """Get all tile files"""
    print('📂 Scanning tiles directory...')
    tiles = []
    for filename in os.listdir(TILES_DIR):
        tile = parse_tile_filename(filename)
        if tile:
            tiles.append(tile)
    
    print(f'✅ Found {len(tiles)} tiles')
    return tiles

def calculate_atlas_dimensions(tiles: List[Dict], max_size: int = SAFE_TEXTURE_SIZE) -> Dict:
    """Calculate texture atlas dimensions"""
    if not tiles:
        return {'tileWidth': 0, 'tileHeight': 0, 'minX': 0, 'maxX': 0, 'minY': 0, 'maxY': 0, 'scale': 1}
    
    # Find bounds
    min_x = min(t['x'] for t in tiles)
    max_x = max(t['x'] for t in tiles)
    min_y = min(t['y'] for t in tiles)
    max_y = max(t['y'] for t in tiles)
    
    width = (max_x - min_x + 1) * TILE_SIZE
    height = (max_y - min_y + 1) * TILE_SIZE
    
    print(f'📐 Tile bounds: x[{min_x}, {max_x}], y[{min_y}, {max_y}]')
    print(f'📐 Calculated atlas size: {width}x{height} pixels')
    print(f'📐 Max allowed size: {max_size}x{max_size} pixels')
    
    # Check if we need scaling
    needs_scaling = width > max_size or height > max_size
    
    if needs_scaling:
        scale_x = max_size / width
        scale_y = max_size / height
        scale = min(scale_x, scale_y)
        final_width = int(width * scale)
        final_height = int(height * scale)
        print(f'⚠️  Scaling down to {final_width}x{final_height} (scale: {scale:.3f})')
        print(f'   This will reduce quality but ensure compatibility')
    else:
        scale = 1.0
        final_width = width
        final_height = height
        print(f'✅ Atlas fits within limits, no scaling needed')
    
    return {
        'minX': min_x,
        'maxX': max_x,
        'minY': min_y,
        'maxY': max_y,
        'tileWidth': final_width,
        'tileHeight': final_height,
        'scale': scale,
        'needsScaling': needs_scaling
    }

def composite_tiles(tiles: List[Dict], atlas_config: Dict, show_progress: bool = True) -> Image.Image:
    """Load and composite tiles into a single image"""
    print('🎨 Creating texture atlas...')
    
    min_x = atlas_config['minX']
    max_x = atlas_config['maxX']
    min_y = atlas_config['minY']
    max_y = atlas_config['maxY']
    tile_width = atlas_config['tileWidth']
    tile_height = atlas_config['tileHeight']
    scale = atlas_config['scale']
    
    # Create canvas (RGBA for transparency support)
    canvas = Image.new('RGB', (tile_width, tile_height), color='black')
    
    # Process tiles
    loaded = 0
    total = len(tiles)
    failed = 0
    
    for i, tile in enumerate(tiles):
        try:
            tile_path = TILES_DIR / tile['filename']
            
            if not tile_path.exists():
                failed += 1
                continue
            
            # Load tile image
            tile_img = Image.open(tile_path)
            
            # Convert to RGB if needed
            if tile_img.mode != 'RGB':
                tile_img = tile_img.convert('RGB')
            
            # Calculate position in atlas
            atlas_x = int((tile['x'] - min_x) * TILE_SIZE * scale)
            atlas_y = int((tile['y'] - min_y) * TILE_SIZE * scale)
            scaled_size = int(TILE_SIZE * scale)
            
            # Resize if needed
            if scale != 1.0:
                tile_img = tile_img.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
            
            # Paste tile onto canvas
            canvas.paste(tile_img, (atlas_x, atlas_y))
            
            loaded += 1
            if show_progress and loaded % 1000 == 0:
                progress_pct = loaded/total*100
                print(f'   Progress: {loaded}/{total} tiles ({progress_pct:.1f}%)')
        
        except Exception as e:
            failed += 1
            if failed <= 10:  # Only show first 10 errors
                print(f'   ⚠️  Failed to load {tile["filename"]}: {e}')
    
    print(f'✅ Composited {loaded}/{total} tiles into atlas')
    if failed > 0:
        print(f'   ⚠️  {failed} tiles failed to load')
    
    return canvas

def create_glb_from_texture(texture_image: Image.Image, atlas_config: Dict, compression_level: int = 6, quality: str = 'high') -> None:
    """Create GLB file from texture image"""
    print('📦 Creating GLB file...')
    
    # Save texture as PNG to terrain directory with quality suffix
    TERRAIN_DIR.mkdir(parents=True, exist_ok=True)
    texture_path = TERRAIN_DIR / f"terrain-texture-{quality}.png"
    texture_image.save(texture_path, optimize=True, compress_level=compression_level)
    file_size_mb = texture_path.stat().st_size / 1024 / 1024
    print(f'   Saved texture to {texture_path} ({file_size_mb:.2f} MB)')
    
    # Read texture data
    with open(texture_path, 'rb') as f:
        texture_data = f.read()
    
    # Create plane geometry (simple quad)
    # Vertices for a plane
    vertices = np.array([
        [-1.0, 0.0, -1.0],  # Bottom-left
        [ 1.0, 0.0, -1.0],  # Bottom-right
        [ 1.0, 0.0,  1.0],  # Top-right
        [-1.0, 0.0,  1.0],  # Top-left
    ], dtype=np.float32)
    
    # Indices for two triangles
    indices = np.array([
        0, 1, 2,  # First triangle
        0, 2, 3,  # Second triangle
    ], dtype=np.uint16)
    
    # UV coordinates (texture coordinates)
    uvs = np.array([
        [0.0, 1.0],  # Bottom-left
        [1.0, 1.0],  # Bottom-right
        [1.0, 0.0],  # Top-right
        [0.0, 0.0],  # Top-left
    ], dtype=np.float32)
    
    # Normals (pointing up)
    normals = np.array([
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
    ], dtype=np.float32)
    
    # Flatten arrays
    vertices_bytes = vertices.tobytes()
    indices_bytes = indices.tobytes()
    uvs_bytes = uvs.tobytes()
    normals_bytes = normals.tobytes()
    
    # Create GLTF structure
    gltf = GLTF2()
    gltf.scene = 0
    
    # Create scene
    scene = Scene()
    scene.nodes = [0]
    gltf.scenes = [scene]
    
    # Create node
    node = Node()
    node.mesh = 0
    gltf.nodes = [node]
    
    # Create mesh
    mesh = Mesh()
    primitive = Primitive()
    primitive.attributes = Attributes(
        POSITION=1,
        TEXCOORD_0=2,
        NORMAL=3
    )
    primitive.indices = 0
    primitive.material = 0
    mesh.primitives = [primitive]
    gltf.meshes = [mesh]
    
    # Create buffers
    # Combine all vertex data into one buffer
    buffer_data = b''.join([
        indices_bytes,
        vertices_bytes,
        uvs_bytes,
        normals_bytes,
        texture_data
    ])
    
    buffer = Buffer()
    buffer.byteLength = len(buffer_data)
    buffer.uri = None  # Will be embedded in GLB
    gltf.buffers = [buffer]
    
    # Set buffer data (pygltflib uses a special attribute for binary data)
    gltf.set_binary_blob(buffer_data)
    
    # Create buffer views
    indices_view = BufferView()
    indices_view.buffer = 0
    indices_view.byteOffset = 0
    indices_view.byteLength = len(indices_bytes)
    indices_view.target = 34963  # ELEMENT_ARRAY_BUFFER
    
    vertices_view = BufferView()
    vertices_view.buffer = 0
    vertices_view.byteOffset = len(indices_bytes)
    vertices_view.byteLength = len(vertices_bytes)
    vertices_view.target = 34962  # ARRAY_BUFFER
    
    uvs_view = BufferView()
    uvs_view.buffer = 0
    uvs_view.byteOffset = len(indices_bytes) + len(vertices_bytes)
    uvs_view.byteLength = len(uvs_bytes)
    uvs_view.target = 34962  # ARRAY_BUFFER
    
    normals_view = BufferView()
    normals_view.buffer = 0
    normals_view.byteOffset = len(indices_bytes) + len(vertices_bytes) + len(uvs_bytes)
    normals_view.byteLength = len(normals_bytes)
    normals_view.target = 34962  # ARRAY_BUFFER
    
    texture_view = BufferView()
    texture_view.buffer = 0
    texture_view.byteOffset = len(indices_bytes) + len(vertices_bytes) + len(uvs_bytes) + len(normals_bytes)
    texture_view.byteLength = len(texture_data)
    
    gltf.bufferViews = [
        indices_view,
        vertices_view,
        uvs_view,
        normals_view,
        texture_view
    ]
    
    # Create accessors
    indices_accessor = Accessor()
    indices_accessor.bufferView = 0
    indices_accessor.byteOffset = 0
    indices_accessor.componentType = 5123  # UNSIGNED_SHORT
    indices_accessor.count = len(indices)
    indices_accessor.type = "SCALAR"
    
    vertices_accessor = Accessor()
    vertices_accessor.bufferView = 1
    vertices_accessor.byteOffset = 0
    vertices_accessor.componentType = 5126  # FLOAT
    vertices_accessor.count = len(vertices)
    vertices_accessor.type = "VEC3"
    vertices_accessor.min = vertices.min(axis=0).tolist()
    vertices_accessor.max = vertices.max(axis=0).tolist()
    
    uvs_accessor = Accessor()
    uvs_accessor.bufferView = 2
    uvs_accessor.byteOffset = 0
    uvs_accessor.componentType = 5126  # FLOAT
    uvs_accessor.count = len(uvs)
    uvs_accessor.type = "VEC2"
    
    normals_accessor = Accessor()
    normals_accessor.bufferView = 3
    normals_accessor.byteOffset = 0
    normals_accessor.componentType = 5126  # FLOAT
    normals_accessor.count = len(normals)
    normals_accessor.type = "VEC3"
    
    gltf.accessors = [
        indices_accessor,
        vertices_accessor,
        uvs_accessor,
        normals_accessor
    ]
    
    # Create image
    image = GLTFImage()
    image.bufferView = 4
    image.mimeType = "image/png"
    gltf.images = [image]
    
    # Create texture
    texture = Texture()
    texture.source = 0
    gltf.textures = [texture]
    
    # Create material
    material = Material()
    material.pbrMetallicRoughness = PbrMetallicRoughness()
    material.pbrMetallicRoughness.baseColorTexture = {"index": 0}
    material.pbrMetallicRoughness.metallicFactor = 0.0
    material.pbrMetallicRoughness.roughnessFactor = 1.0
    gltf.materials = [material]
    
    # Save GLB
    print(f'   Writing GLB to {OUTPUT_FILE}...')
    gltf.save_binary(str(OUTPUT_FILE))
    
    file_size = OUTPUT_FILE.stat().st_size / 1024 / 1024
    print(f'✅ GLB file created: {OUTPUT_FILE} ({file_size:.2f} MB)')
    
    # Save metadata
    metadata = {
        'atlasConfig': atlas_config,
        'tileSize': TILE_SIZE,
        'createdAt': str(Path(__file__).stat().st_mtime)
    }
    metadata_path = OUTPUT_DIR / 'terrain-metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f'✅ Metadata saved to {metadata_path}')

def main():
    """Main function"""
    import sys
    
    # Parse command line arguments
    quality = 'high'  # default
    if len(sys.argv) > 1:
        quality = sys.argv[1].lower()
        if quality not in QUALITY_PRESETS:
            print(f'⚠️  Unknown quality preset: {quality}')
            print(f'   Available: {", ".join(QUALITY_PRESETS.keys())}')
            print(f'   Using default: high')
            quality = 'high'
    
    preset = QUALITY_PRESETS[quality]
    max_size = preset['max_size']
    compression = preset['compression']
    
    print('🚀 Starting tile to GLB conversion...')
    print(f'📊 Quality preset: {quality} (max texture: {max_size}x{max_size}, compression: {compression})\n')
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        # Step 1: Get all tiles
        tiles = get_all_tiles()
        if not tiles:
            print('❌ No tiles found!')
            return 1
        
        # Step 2: Calculate atlas dimensions
        atlas_config = calculate_atlas_dimensions(tiles, max_size=max_size)
        print(f'\n📊 Atlas Configuration:')
        print(f'   Size: {atlas_config["tileWidth"]}x{atlas_config["tileHeight"]}')
        print(f'   Scale: {atlas_config["scale"]:.3f}')
        print(f'   Needs scaling: {atlas_config["needsScaling"]}\n')
        
        # Step 3: Composite tiles
        texture_image = composite_tiles(tiles, atlas_config)
        
        # Step 4: Create GLB
        create_glb_from_texture(texture_image, atlas_config, compression_level=compression, quality=quality)
        
        print('\n✅ Conversion complete!')
        print(f'\n📦 Output files:')
        print(f'   GLB: {OUTPUT_FILE}')
        print(f'   Texture: {TERRAIN_DIR / f"terrain-texture-{quality}.png"}')
        print(f'   Metadata: {OUTPUT_DIR / "terrain-metadata.json"}')
        print(f'\n💡 Tip: Use different quality presets:')
        print(f'   python scripts/tiles-to-glb.py ultra  # Best quality (16k texture)')
        print(f'   python scripts/tiles-to-glb.py high   # High quality (8k texture) [default]')
        print(f'   python scripts/tiles-to-glb.py medium # Medium quality (4k texture)')
        print(f'   python scripts/tiles-to-glb.py low    # Low quality (2k texture)')
        
    except Exception as error:
        print(f'❌ Error: {error}')
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
