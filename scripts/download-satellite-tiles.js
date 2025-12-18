#!/usr/bin/env node

/**
 * Download satellite tiles for Cabo Negro, Chile terrain
 * Downloads tiles from ESRI World Imagery and saves them locally
 * 
 * Usage: node scripts/download-satellite-tiles.js [zoom] [outputDir]
 * Example: node scripts/download-satellite-tiles.js 13 public/assets/tiles
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Terrain center coordinates
const TERRAIN_CENTER = {
  lat: -53.061222,
  lng: -70.878388
};

// Calculate tile coordinates from lat/lng
function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// Get ESRI tile URL
function getEsriTileUrl(x, y, zoom) {
  const endpoints = [
    'server.arcgisonline.com',
    'services.arcgisonline.com'
  ];
  const endpoint = endpoints[(x + y) % endpoints.length];
  return `https://${endpoint}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

// Download a single tile
function downloadTile(x, y, zoom, outputDir) {
  return new Promise((resolve, reject) => {
    const url = getEsriTileUrl(x, y, zoom);
    const urlObj = new URL(url);
    const filename = path.join(outputDir, `${zoom}_${x}_${y}.png`);
    
    // Skip if already exists
    if (fs.existsSync(filename)) {
      resolve({ x, y, cached: true });
      return;
    }
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TileDownloader/1.0)'
      }
    };
    
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve({ x, y, success: true });
        });
      } else if (res.statusCode === 404) {
        // Tile doesn't exist, create placeholder
        const placeholder = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
          // ... (simplified - create a 1x1 gray PNG)
        ]);
        fs.writeFileSync(filename, Buffer.alloc(256 * 256 * 4, 204)); // Gray placeholder
        resolve({ x, y, placeholder: true });
      } else {
        reject(new Error(`HTTP ${res.statusCode} for tile ${x}/${y}`));
      }
    });
    
    req.on('error', (error) => {
      console.error(`Error downloading tile ${x}/${y}:`, error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error(`Timeout downloading tile ${x}/${y}`));
    });
    
    req.end();
  });
}

// Calculate required tiles
function getRequiredTiles(zoom, radiusKm = 40) {
  const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom);
  const metersPerTile = 156543.03392 * Math.cos(TERRAIN_CENTER.lat * Math.PI / 180) / Math.pow(2, zoom);
  const radiusInTiles = Math.ceil((radiusKm * 1000) / metersPerTile);
  const maxTiles = 150;
  const actualRadius = Math.min(radiusInTiles, maxTiles);
  
  const tiles = [];
  const minX = centerTile.x - actualRadius;
  const maxX = centerTile.x + actualRadius;
  const minY = centerTile.y - actualRadius;
  const maxY = centerTile.y + actualRadius;
  
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ x, y });
    }
  }
  
  return { tiles, centerTile, bounds: { minX, maxX, minY, maxY } };
}

// Download tiles with concurrency limit
async function downloadTiles(tiles, zoom, outputDir, concurrency = 5) {
  let downloaded = 0;
  let failed = 0;
  let cached = 0;
  
  console.log(`Downloading ${tiles.length} tiles with concurrency ${concurrency}...`);
  
  for (let i = 0; i < tiles.length; i += concurrency) {
    const batch = tiles.slice(i, i + concurrency);
    const promises = batch.map(tile => 
      downloadTile(tile.x, tile.y, zoom, outputDir)
        .catch(error => {
          console.error(`Failed to download tile ${tile.x}/${tile.y}:`, error.message);
          return { x: tile.x, y: tile.y, failed: true };
        })
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      if (result.cached) cached++;
      else if (result.success) downloaded++;
      else if (result.failed) failed++;
    });
    
    const progress = ((i + batch.length) / tiles.length * 100).toFixed(1);
    process.stdout.write(`\rProgress: ${progress}% (${downloaded} downloaded, ${cached} cached, ${failed} failed)`);
  }
  
  console.log('\n');
  return { downloaded, cached, failed, total: tiles.length };
}

// Main function
async function main() {
  const zoom = parseInt(process.argv[2]) || 13;
  const outputDir = process.argv[3] || path.join(process.cwd(), 'public', 'assets', 'tiles');
  
  console.log('=== Satellite Tile Downloader ===');
  console.log(`Terrain Center: ${TERRAIN_CENTER.lat}, ${TERRAIN_CENTER.lng}`);
  console.log(`Zoom Level: ${zoom}`);
  console.log(`Output Directory: ${outputDir}`);
  console.log('');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }
  
  // Calculate required tiles
  const { tiles, centerTile, bounds } = getRequiredTiles(zoom);
  console.log(`Center tile: ${centerTile.x}/${centerTile.y}`);
  console.log(`Tile bounds: X: ${bounds.minX}-${bounds.maxX}, Y: ${bounds.minY}-${bounds.maxY}`);
  console.log(`Total tiles needed: ${tiles.length}`);
  console.log('');
  
  // Download tiles
  const startTime = Date.now();
  const stats = await downloadTiles(tiles, zoom, outputDir, 5);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('');
  console.log('=== Download Complete ===');
  console.log(`Duration: ${duration}s`);
  console.log(`Downloaded: ${stats.downloaded}`);
  console.log(`Cached: ${stats.cached}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Total: ${stats.total}`);
  console.log('');
  console.log(`Tiles saved to: ${outputDir}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Update map-tiles.ts to use local tiles');
  console.log('2. Restart your dev server');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { downloadTile, getRequiredTiles, latLngToTile };


