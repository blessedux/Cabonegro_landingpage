#!/usr/bin/env node

/**
 * Convert 90k tiles into a single optimized GLB file
 * 
 * This script:
 * 1. Loads all PNG tiles from public/assets/tiles/
 * 2. Composites them into a texture atlas
 * 3. Creates a 3D plane mesh with the texture
 * 4. Exports as optimized GLB file
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');
const { Scene, Mesh, PlaneGeometry, MeshBasicMaterial, TextureLoader, sRGBEncoding } = require('three');

// Configuration
const TILES_DIR = path.join(__dirname, '../public/assets/tiles');
const OUTPUT_DIR = path.join(__dirname, '../public/assets/models');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'terrain-tiles.glb');

// Tile configuration
const TILE_SIZE = 256; // Each tile is 256x256 pixels
const MAX_TEXTURE_SIZE = 16384; // Maximum texture size (16k for most GPUs)
const BATCH_SIZE = 1000; // Process tiles in batches to avoid memory issues

// Parse tile filename: {zoom}_{x}_{y}.png
function parseTileFilename(filename) {
  const match = filename.match(/^(\d+)_(\d+)_(\d+)\.png$/);
  if (!match) return null;
  return {
    zoom: parseInt(match[1], 10),
    x: parseInt(match[2], 10),
    y: parseInt(match[3], 10),
    filename
  };
}

// Get all tile files
function getAllTiles() {
  console.log('📂 Scanning tiles directory...');
  const files = fs.readdirSync(TILES_DIR);
  const tiles = files
    .map(parseTileFilename)
    .filter(tile => tile !== null);
  
  console.log(`✅ Found ${tiles.length} tiles`);
  return tiles;
}

// Calculate texture atlas dimensions
function calculateAtlasDimensions(tiles) {
  // Find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  tiles.forEach(tile => {
    minX = Math.min(minX, tile.x);
    maxX = Math.max(maxX, tile.x);
    minY = Math.min(minY, tile.y);
    maxY = Math.max(maxY, tile.y);
  });
  
  const width = (maxX - minX + 1) * TILE_SIZE;
  const height = (maxY - minY + 1) * TILE_SIZE;
  
  console.log(`📐 Tile bounds: x[${minX}, ${maxX}], y[${minY}, ${maxY}]`);
  console.log(`📐 Calculated atlas size: ${width}x${height} pixels`);
  
  // Check if we need to split into multiple atlases
  if (width > MAX_TEXTURE_SIZE || height > MAX_TEXTURE_SIZE) {
    console.warn(`⚠️  Atlas size exceeds maximum (${MAX_TEXTURE_SIZE}x${MAX_TEXTURE_SIZE})`);
    console.warn(`   Will create multiple texture atlases or downsample`);
    
    // Calculate scale factor to fit within limits
    const scaleX = MAX_TEXTURE_SIZE / width;
    const scaleY = MAX_TEXTURE_SIZE / height;
    const scale = Math.min(scaleX, scaleY);
    
    return {
      minX, maxX, minY, maxY,
      tileWidth: Math.floor(width * scale),
      tileHeight: Math.floor(height * scale),
      scale,
      needsScaling: true
    };
  }
  
  return {
    minX, maxX, minY, maxY,
    tileWidth: width,
    tileHeight: height,
    scale: 1,
    needsScaling: false
  };
}

// Load and composite tiles into canvas
async function compositeTiles(tiles, atlasConfig) {
  console.log('🎨 Creating texture atlas...');
  
  const { minX, maxX, minY, maxY, tileWidth, tileHeight, scale } = atlasConfig;
  
  // Create canvas
  const canvas = createCanvas(tileWidth, tileHeight);
  const ctx = canvas.getContext('2d');
  
  // Set background (transparent or black)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, tileWidth, tileHeight);
  
  // Process tiles in batches
  let loaded = 0;
  const total = tiles.length;
  
  for (let i = 0; i < tiles.length; i += BATCH_SIZE) {
    const batch = tiles.slice(i, i + BATCH_SIZE);
    console.log(`   Loading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)} (${batch.length} tiles)...`);
    
    await Promise.all(batch.map(async (tile) => {
      try {
        const tilePath = path.join(TILES_DIR, tile.filename);
        const image = await loadImage(tilePath);
        
        // Calculate position in atlas
        const atlasX = (tile.x - minX) * TILE_SIZE * scale;
        const atlasY = (tile.y - minY) * TILE_SIZE * scale;
        const scaledSize = TILE_SIZE * scale;
        
        // Draw tile to canvas
        if (scale === 1) {
          ctx.drawImage(image, atlasX, atlasY);
        } else {
          ctx.drawImage(image, atlasX, atlasY, scaledSize, scaledSize);
        }
        
        loaded++;
        if (loaded % 1000 === 0) {
          console.log(`   Progress: ${loaded}/${total} tiles (${Math.round(loaded/total*100)}%)`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Failed to load ${tile.filename}: ${error.message}`);
      }
    }));
  }
  
  console.log(`✅ Composited ${loaded}/${total} tiles into atlas`);
  return canvas;
}

// Convert canvas to buffer and create Three.js texture
function canvasToTexture(canvas) {
  console.log('🖼️  Converting canvas to texture...');
  
  // Convert canvas to buffer
  const buffer = canvas.toBuffer('image/png');
  
  // Save intermediate texture for debugging (optional)
  const debugPath = path.join(OUTPUT_DIR, 'terrain-atlas.png');
  fs.writeFileSync(debugPath, buffer);
  console.log(`   Saved debug texture to ${debugPath}`);
  
  return buffer;
}

// Create GLB from texture
async function createGLB(textureBuffer, atlasConfig) {
  console.log('📦 Creating GLB file...');
  
  // Note: This is a simplified version. For production, you'd want to:
  // 1. Use Three.js properly with TextureLoader
  // 2. Create a proper scene with lighting
  // 3. Optimize the geometry
  // 4. Use proper GLB compression
  
  // For now, we'll create a simple approach using a Node.js GLB writer
  // Since we can't easily use Three.js in Node.js without headless-gl or similar,
  // we'll use a different approach: create the GLB manually or use a library
  
  console.log('⚠️  Note: Full Three.js integration requires headless-gl or similar.');
  console.log('   For now, saving texture atlas. You can use Blender or other tools');
  console.log('   to create the GLB from the texture atlas.');
  
  // Save texture buffer
  const texturePath = path.join(OUTPUT_DIR, 'terrain-texture.png');
  fs.writeFileSync(texturePath, textureBuffer);
  
  // Save metadata
  const metadata = {
    atlasConfig,
    tileSize: TILE_SIZE,
    createdAt: new Date().toISOString()
  };
  const metadataPath = path.join(OUTPUT_DIR, 'terrain-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  console.log(`✅ Saved texture to ${texturePath}`);
  console.log(`✅ Saved metadata to ${metadataPath}`);
  
  return { texturePath, metadataPath };
}

// Main function
async function main() {
  console.log('🚀 Starting tile to GLB conversion...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  try {
    // Step 1: Get all tiles
    const tiles = getAllTiles();
    if (tiles.length === 0) {
      console.error('❌ No tiles found!');
      process.exit(1);
    }
    
    // Step 2: Calculate atlas dimensions
    const atlasConfig = calculateAtlasDimensions(tiles);
    console.log(`\n📊 Atlas Configuration:`);
    console.log(`   Size: ${atlasConfig.tileWidth}x${atlasConfig.tileHeight}`);
    console.log(`   Scale: ${atlasConfig.scale}`);
    console.log(`   Needs scaling: ${atlasConfig.needsScaling}\n`);
    
    // Step 3: Composite tiles
    const canvas = await compositeTiles(tiles, atlasConfig);
    
    // Step 4: Convert to texture
    const textureBuffer = canvasToTexture(canvas);
    
    // Step 5: Create GLB (or save intermediate files)
    await createGLB(textureBuffer, atlasConfig);
    
    console.log('\n✅ Conversion complete!');
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Use the texture atlas PNG to create a GLB in Blender or similar`);
    console.log(`   2. Or use the Python script (tiles-to-glb-python.py) for full automation`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, getAllTiles, calculateAtlasDimensions };
