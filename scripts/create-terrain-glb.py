#!/usr/bin/env python3
"""
Create high-resolution 3D GLB terrain model with heightmap displacement

This script:
1. Loads heightmap PNG and satellite texture
2. Creates a 3D mesh with realistic terrain displacement
3. Applies satellite texture
4. Optimizes mesh for performance
5. Exports as optimized GLB file

Usage:
    python scripts/create-terrain-glb.py [quality]
    
    quality: ultra, high (default), medium, low
"""

import sys
import os
import json
import math
import io
from pathlib import Path
from typing import Tuple, Optional

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
PROJECT_ROOT = Path(__file__).parent.parent
TERRAIN_DIR = PROJECT_ROOT / "public" / "assets" / "terrain"
OUTPUT_DIR = PROJECT_ROOT / "public" / "assets" / "models"
OUTPUT_FILE = OUTPUT_DIR / "terrain-3d.glb"

# Default file paths
HEIGHTMAP_PATH = TERRAIN_DIR / "heightmap-glb.png"
TEXTURE_PATH = TERRAIN_DIR / "texture-glb.png"

# Quality presets
QUALITY_PRESETS = {
    'ultra': {
        'mesh_segments': 512,  # High detail mesh
        'height_scale': 500.0,  # Height displacement scale in meters
        'texture_size': 4096,
        'compression': 0
    },
    'high': {
        'mesh_segments': 256,  # Good detail, balanced
        'height_scale': 500.0,
        'texture_size': 2048,
        'compression': 1
    },
    'medium': {
        'mesh_segments': 128,
        'height_scale': 500.0,
        'texture_size': 1024,
        'compression': 6
    },
    'low': {
        'mesh_segments': 64,
        'height_scale': 500.0,
        'texture_size': 512,
        'compression': 9
    }
}

def load_heightmap(path: Path) -> Optional[np.ndarray]:
    """Load heightmap PNG and convert to normalized height values"""
    if not path.exists():
        print(f"❌ Heightmap not found: {path}")
        return None
    
    print(f"📥 Loading heightmap: {path}")
    img = Image.open(path)
    
    # Convert to grayscale if needed
    if img.mode != 'L':
        img = img.convert('L')
    
    # Convert to numpy array and normalize to 0-1 range
    heightmap = np.array(img, dtype=np.float32) / 255.0
    
    print(f"   Size: {heightmap.shape[1]}x{heightmap.shape[0]}")
    print(f"   Height range: {heightmap.min():.3f} to {heightmap.max():.3f}")
    
    return heightmap

def load_texture(path: Path, target_size: int) -> Optional[np.ndarray]:
    """Load satellite texture and resize if needed"""
    if not path.exists():
        print(f"⚠️  Texture not found: {path}")
        print(f"   Will create a default texture")
        return None
    
    print(f"📥 Loading texture: {path}")
    img = Image.open(path)
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to target size if needed
    if img.size[0] != target_size or img.size[1] != target_size:
        print(f"   Resizing from {img.size} to {target_size}x{target_size}")
        img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    # Convert to numpy array
    texture = np.array(img, dtype=np.uint8)
    
    print(f"   Size: {texture.shape[1]}x{texture.shape[0]}")
    
    return texture

def create_terrain_mesh(heightmap: np.ndarray, segments: int, height_scale: float, terrain_size: float = 40000.0) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Create 3D terrain mesh from heightmap
    
    Args:
        heightmap: Normalized heightmap (0-1 range)
        segments: Number of segments per side (mesh resolution)
        height_scale: Maximum height displacement in meters
        terrain_size: Size of terrain in meters (default 40km for 20km radius)
    
    Returns:
        vertices, indices, uvs, normals
    """
    print(f"🏔️  Creating terrain mesh...")
    print(f"   Segments: {segments}x{segments}")
    print(f"   Height scale: {height_scale}m")
    print(f"   Terrain size: {terrain_size}m")
    
    h, w = heightmap.shape
    
    # Sample heightmap at mesh resolution
    # Use bilinear interpolation to sample heightmap
    vertices = []
    uvs = []
    
    half_size = terrain_size / 2.0
    
    for y in range(segments + 1):
        for x in range(segments + 1):
            # UV coordinates (0-1)
            u = x / segments
            v = y / segments
            
            # Sample heightmap using bilinear interpolation
            # Map UV to heightmap coordinates
            hm_x = int(u * (w - 1))
            hm_y = int(v * (h - 1))
            
            # Clamp to valid range
            hm_x = max(0, min(w - 1, hm_x))
            hm_y = max(0, min(h - 1, hm_y))
            
            # Get height value
            height = heightmap[hm_y, hm_x] * height_scale
            
            # World position
            world_x = (u - 0.5) * terrain_size
            world_z = (v - 0.5) * terrain_size
            world_y = height
            
            vertices.append([world_x, world_y, world_z])
            uvs.append([u, 1.0 - v])  # Flip V coordinate for OpenGL convention
    
    # Create indices for triangles
    indices = []
    for y in range(segments):
        for x in range(segments):
            # Get vertex indices for this quad
            i0 = y * (segments + 1) + x
            i1 = y * (segments + 1) + (x + 1)
            i2 = (y + 1) * (segments + 1) + (x + 1)
            i3 = (y + 1) * (segments + 1) + x
            
            # Two triangles per quad
            indices.extend([i0, i1, i2])
            indices.extend([i0, i2, i3])
    
    vertices = np.array(vertices, dtype=np.float32)
    indices = np.array(indices, dtype=np.uint32)
    uvs = np.array(uvs, dtype=np.float32)
    
    # Calculate normals
    print(f"   Calculating normals...")
    normals = calculate_normals(vertices, indices, segments)
    
    print(f"   Vertices: {len(vertices)}")
    print(f"   Triangles: {len(indices) // 3}")
    
    return vertices, indices, uvs, normals

def calculate_normals(vertices: np.ndarray, indices: np.ndarray, segments: int) -> np.ndarray:
    """Calculate vertex normals from mesh"""
    normals = np.zeros_like(vertices)
    
    # Calculate face normals and accumulate
    for i in range(0, len(indices), 3):
        i0, i1, i2 = indices[i], indices[i+1], indices[i+2]
        
        v0 = vertices[i0]
        v1 = vertices[i1]
        v2 = vertices[i2]
        
        # Edge vectors
        edge1 = v1 - v0
        edge2 = v2 - v0
        
        # Face normal
        normal = np.cross(edge1, edge2)
        normal_length = np.linalg.norm(normal)
        
        if normal_length > 0:
            normal = normal / normal_length
        
        # Accumulate to vertex normals
        normals[i0] += normal
        normals[i1] += normal
        normals[i2] += normal
    
    # Normalize vertex normals
    norms = np.linalg.norm(normals, axis=1, keepdims=True)
    norms[norms == 0] = 1.0  # Avoid division by zero
    normals = normals / norms
    
    return normals.astype(np.float32)

def optimize_texture(texture: np.ndarray, target_size: int) -> np.ndarray:
    """Resize texture to target size"""
    if texture is None:
        # Create default texture (green terrain)
        texture = np.zeros((target_size, target_size, 3), dtype=np.uint8)
        texture[:, :] = [34, 139, 34]  # Forest green
        return texture
    
    if texture.shape[0] == target_size and texture.shape[1] == target_size:
        return texture
    
    # Resize using PIL
    img = Image.fromarray(texture)
    img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return np.array(img, dtype=np.uint8)

def create_glb(vertices: np.ndarray, indices: np.ndarray, uvs: np.ndarray, normals: np.ndarray, texture: np.ndarray, output_path: Path, quality: str):
    """Create GLB file from mesh and texture"""
    print(f"\n📦 Creating GLB file...")
    
    # Prepare texture
    # Convert numpy array to PIL Image
    if texture is None:
        print("   ⚠️  No texture provided, creating default texture")
        texture = np.zeros((512, 512, 3), dtype=np.uint8)
        texture[:, :] = [34, 139, 34]  # Forest green
    
    texture_img = Image.fromarray(texture, mode='RGB')
    
    # Save texture as PNG for reference
    texture_ref_path = TERRAIN_DIR / f"terrain-texture-{quality}.png"
    texture_img.save(texture_ref_path, optimize=True)
    print(f"   Saved texture reference: {texture_ref_path}")
    
    # Get texture as PNG bytes for GLB
    texture_buffer = io.BytesIO()
    texture_img.save(texture_buffer, format='PNG')
    texture_bytes = texture_buffer.getvalue()
    
    # Convert indices to uint16 if possible, otherwise uint32
    if len(vertices) < 65536:
        indices = indices.astype(np.uint16)
        index_component_type = 5123  # UNSIGNED_SHORT
    else:
        indices = indices.astype(np.uint32)
        index_component_type = 5125  # UNSIGNED_INT
    
    # Flatten arrays to bytes
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
    
    # Combine all data into one buffer
    buffer_data = b''.join([
        indices_bytes,
        vertices_bytes,
        uvs_bytes,
        normals_bytes,
        texture_bytes
    ])
    
    buffer = Buffer()
    buffer.byteLength = len(buffer_data)
    buffer.uri = None  # Embedded in GLB
    gltf.buffers = [buffer]
    
    # Set binary blob
    gltf.set_binary_blob(buffer_data)
    
    # Create buffer views
    offset = 0
    
    indices_view = BufferView()
    indices_view.buffer = 0
    indices_view.byteOffset = offset
    indices_view.byteLength = len(indices_bytes)
    indices_view.target = 34963  # ELEMENT_ARRAY_BUFFER
    offset += len(indices_bytes)
    
    vertices_view = BufferView()
    vertices_view.buffer = 0
    vertices_view.byteOffset = offset
    vertices_view.byteLength = len(vertices_bytes)
    vertices_view.target = 34962  # ARRAY_BUFFER
    offset += len(vertices_bytes)
    
    uvs_view = BufferView()
    uvs_view.buffer = 0
    uvs_view.byteOffset = offset
    uvs_view.byteLength = len(uvs_bytes)
    uvs_view.target = 34962  # ARRAY_BUFFER
    offset += len(uvs_bytes)
    
    normals_view = BufferView()
    normals_view.buffer = 0
    normals_view.byteOffset = offset
    normals_view.byteLength = len(normals_bytes)
    normals_view.target = 34962  # ARRAY_BUFFER
    offset += len(normals_bytes)
    
    texture_view = BufferView()
    texture_view.buffer = 0
    texture_view.byteOffset = offset
    texture_view.byteLength = len(texture_bytes)
    
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
    indices_accessor.componentType = index_component_type
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
    texture_gltf = Texture()
    texture_gltf.source = 0
    gltf.textures = [texture_gltf]
    
    # Create material
    material = Material()
    material.pbrMetallicRoughness = PbrMetallicRoughness()
    material.pbrMetallicRoughness.baseColorTexture = {"index": 0}
    material.pbrMetallicRoughness.metallicFactor = 0.0
    material.pbrMetallicRoughness.roughnessFactor = 1.0
    gltf.materials = [material]
    
    # Save GLB
    print(f"   Writing GLB to {output_path}...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    gltf.save_binary(str(output_path))
    
    file_size = output_path.stat().st_size / 1024 / 1024
    print(f"✅ GLB file created: {output_path} ({file_size:.2f} MB)")
    
    # Save metadata
    metadata = {
        'quality': quality,
        'vertices': len(vertices),
        'triangles': len(indices) // 3,
        'textureSize': texture.shape[:2],
        'createdAt': str(Path(__file__).stat().st_mtime)
    }
    metadata_path = OUTPUT_DIR / 'terrain-3d-metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata saved: {metadata_path}")

def main():
    """Main function"""
    # Parse quality preset
    quality = 'high'  # default
    if len(sys.argv) > 1:
        quality = sys.argv[1].lower()
        if quality not in QUALITY_PRESETS:
            print(f"⚠️  Unknown quality preset: {quality}")
            print(f"   Available: {', '.join(QUALITY_PRESETS.keys())}")
            print(f"   Using default: high")
            quality = 'high'
    
    preset = QUALITY_PRESETS[quality]
    
    print("🚀 Creating 3D Terrain GLB")
    print(f"📊 Quality preset: {quality}")
    print(f"   Mesh segments: {preset['mesh_segments']}x{preset['mesh_segments']}")
    print(f"   Height scale: {preset['height_scale']}m")
    print(f"   Texture size: {preset['texture_size']}x{preset['texture_size']}\n")
    
    # Load heightmap
    heightmap = load_heightmap(HEIGHTMAP_PATH)
    if heightmap is None:
        print("\n❌ Cannot proceed without heightmap!")
        print(f"   Please run: python scripts/download-terrain-for-glb.py YOUR_API_KEY")
        return 1
    
    # Load texture
    texture = load_texture(TEXTURE_PATH, preset['texture_size'])
    texture = optimize_texture(texture, preset['texture_size'])
    
    # Create terrain mesh
    vertices, indices, uvs, normals = create_terrain_mesh(
        heightmap,
        preset['mesh_segments'],
        preset['height_scale']
    )
    
    # Create GLB
    create_glb(vertices, indices, uvs, normals, texture, OUTPUT_FILE, quality)
    
    print(f"\n✅ Complete!")
    print(f"\n📦 Output file: {OUTPUT_FILE}")
    print(f"\n💡 Usage in Three.js:")
    print(f"   import {{ GLTFLoader }} from 'three/examples/jsm/loaders/GLTFLoader.js';")
    print(f"   const loader = new GLTFLoader();")
    print(f"   loader.load('/assets/models/terrain-3d.glb', (gltf) => {{")
    print(f"     scene.add(gltf.scene);")
    print(f"   }});")
    
    return 0

if __name__ == '__main__':
    exit(main())

