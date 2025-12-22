#!/usr/bin/env node

/**
 * Test satellite tile URLs to see which providers work
 * Helps debug why tiles aren't loading
 */

const https = require('https');
const http = require('http');

const TERRAIN_CENTER = { lat: -53.061222, lng: -70.878388 };
const zoom = 13;

function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function getEsriTileUrl(x, y, zoom) {
  const endpoints = ['server.arcgisonline.com', 'services.arcgisonline.com'];
  const endpoint = endpoints[(x + y) % endpoints.length];
  return `https://${endpoint}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

function getBingTileUrl(x, y, zoom) {
  // Simplified - Bing uses quadkey which is more complex
  return `https://t0.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${x}_${y}_${zoom}?mkt=en-US&it=A&og=2&n=z`;
}

function getGoogleTileUrl(x, y, zoom) {
  const subdomain = (x + y) % 4;
  return `https://mt${subdomain}.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${zoom}`;
}

function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TileTester/1.0)'
      },
      timeout: 5000
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      resolve({
        success: res.statusCode === 200,
        statusCode: res.statusCode,
        url
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        url
      });
    });

    req.end();
  });
}

async function main() {
  const centerTile = latLngToTile(TERRAIN_CENTER.lat, TERRAIN_CENTER.lng, zoom);
  
  console.log('=== Testing Satellite Tile URLs ===');
  console.log(`Terrain Center: ${TERRAIN_CENTER.lat}, ${TERRAIN_CENTER.lng}`);
  console.log(`Zoom Level: ${zoom}`);
  console.log(`Center Tile: ${centerTile.x}/${centerTile.y}`);
  console.log('');

  const tests = [
    {
      name: 'ESRI World Imagery',
      url: getEsriTileUrl(centerTile.x, centerTile.y, zoom)
    },
    {
      name: 'ESRI (alt endpoint)',
      url: `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${centerTile.y}/${centerTile.x}`
    },
    {
      name: 'Google Satellite',
      url: getGoogleTileUrl(centerTile.x, centerTile.y, zoom)
    },
    {
      name: 'Bing Maps Aerial',
      url: getBingTileUrl(centerTile.x, centerTile.y, zoom)
    }
  ];

  console.log('Testing tile URLs...\n');

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    const result = await testUrl(test.url);
    
    if (result.success) {
      console.log(`✅ SUCCESS (${result.statusCode})`);
      console.log(`   URL: ${test.url}`);
      console.log(`   → Open in browser to verify: ${test.url}`);
    } else {
      console.log(`❌ FAILED`);
      if (result.statusCode) {
        console.log(`   Status: ${result.statusCode}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log(`   URL: ${test.url}`);
    }
    console.log('');
  }

  console.log('=== Recommendations ===');
  console.log('1. If ESRI works: Use local tiles (download with download-satellite-tiles.js)');
  console.log('2. If all fail: Check internet connection and firewall');
  console.log('3. If CORS errors in browser: Use local tiles (no CORS issues)');
  console.log('4. Open successful URLs in browser to verify they show satellite imagery');
}

main().catch(console.error);



