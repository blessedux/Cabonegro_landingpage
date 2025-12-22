#!/usr/bin/env python3
"""
Download heightmap and satellite texture for specific coordinates
Coordinates: 52°56'13.7"S 70°50'58.7"W (Punta Arenas, Chile)

This script:
1. Downloads DEM heightmap data from OpenTopography API
2. Downloads satellite imagery tiles from ESRI World Imagery
3. Processes DEM into heightmap PNG
4. Stitches satellite tiles into texture image

Usage:
    python scripts/download-terrain-data.py [API_KEY] [radius_km]
    
    API_KEY: Your OpenTopography API key (get from https://portal.opentopography.org/apidocs/)
    radius_km: Radius in kilometers around the center point (default: 20)
"""

import sys
import os
import requests
import subprocess
from pathlib import Path
import json

# Convert coordinates: 52°56'13.7"S 70°50'58.7"W
# 52°56'13.7"S = -52.9371° (negative for South)
# 70°50'58.7"W = -70.8496° (negative for West)
TERRAIN_CENTER = {
    'lat': -52.9371,
    'lng': -70.8496
}

# Default radius in kilometers
DEFAULT_RADIUS_KM = 20

# OpenTopography API endpoint
OPENTOPO_API_URL = "https://portal.opentopography.org/API/globaldem"

# DEM type (SRTMGL1 is 30m resolution, good for terrain)
DEM_TYPE = "SRTMGL1"

# Project directories
PROJECT_ROOT = Path(__file__).parent.parent
TERRAIN_DIR = PROJECT_ROOT / "public" / "assets" / "terrain"
TILES_DIR = PROJECT_ROOT / "public" / "assets" / "tiles"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

def calculate_bounds(center_lat, center_lng, radius_km):
    """
    Calculate bounding box for a given center point and radius
    
    At latitude -53°, approximate conversions:
    - 1° latitude ≈ 111,320 meters
    - 1° longitude ≈ 66,960 meters (varies with latitude)
    """
    # Convert radius to degrees
    lat_radius = radius_km / 111.32  # km to degrees latitude
    lng_radius = radius_km / (111.32 * abs(center_lat) / 90)  # Adjusted for latitude
    
    bounds = {
        'south': center_lat - lat_radius,
        'north': center_lat + lat_radius,
        'west': center_lng - lng_radius,
        'east': center_lng + lng_radius
    }
    
    return bounds

def download_dem(api_key, bounds, output_path):
    """Download DEM data from OpenTopography API"""
    print(f"\n{'='*60}")
    print("📥 Downloading DEM Heightmap Data")
    print(f"{'='*60}")
    print(f"Center: {TERRAIN_CENTER['lat']}°, {TERRAIN_CENTER['lng']}°")
    print(f"Bounds: {bounds['south']:.4f}° to {bounds['north']:.4f}° lat")
    print(f"        {bounds['west']:.4f}° to {bounds['east']:.4f}° lng")
    print(f"DEM Type: {DEM_TYPE} (30m resolution)")
    
    # Create output directory
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Construct API request
    params = {
        'demtype': DEM_TYPE,
        'south': bounds['south'],
        'north': bounds['north'],
        'west': bounds['west'],
        'east': bounds['east'],
        'outputFormat': 'GTiff',
        'API_Key': api_key
    }
    
    try:
        print(f"\nRequesting DEM from OpenTopography API...")
        response = requests.get(OPENTOPO_API_URL, params=params, stream=True, timeout=300)
        
        if response.status_code == 200:
            print(f"Downloading to: {output_path}")
            with open(output_path, 'wb') as f:
                total_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        total_size += len(chunk)
                        if total_size % (1024 * 1024) == 0:  # Print every MB
                            print(f"  Downloaded: {total_size / (1024 * 1024):.1f} MB", end='\r')
            
            file_size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"\n✓ DEM downloaded successfully! ({file_size_mb:.2f} MB)")
            return True
        else:
            print(f"✗ Error: HTTP {response.status_code}")
            print(f"  Response: {response.text[:500]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error downloading DEM: {e}")
        return False

def download_satellite_tiles(center_lat, center_lng, radius_km, zoom_level=13):
    """Download satellite tiles using Node.js script"""
    print(f"\n{'='*60}")
    print("🛰️  Downloading Satellite Imagery Tiles")
    print(f"{'='*60}")
    print(f"Center: {center_lat}°, {center_lng}°")
    print(f"Radius: {radius_km} km")
    print(f"Zoom Level: {zoom_level}")
    
    # Create a temporary script to download tiles for these specific coordinates
    temp_script = SCRIPTS_DIR / "download-tiles-temp.js"
    
    # Read the base download script
    base_script_path = SCRIPTS_DIR / "download-satellite-tiles.js"
    if not base_script_path.exists():
        print("✗ Error: download-satellite-tiles.js not found!")
        return False
    
    # Create modified script with our coordinates
    script_content = f"""#!/usr/bin/env node
// Temporary script for downloading tiles at specific coordinates
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const TERRAIN_CENTER = {{
  lat: {center_lat},
  lng: {center_lng}
}};

const TILES_DIR = '{TILES_DIR}';
const ZOOM = {zoom_level};
const RADIUS_KM = {radius_km};

// Calculate tile coordinates from lat/lng
function latLngToTile(lat, lng, zoom) {{
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return {{ x, y }};
}}

// Get ESRI tile URL
function getEsriTileUrl(x, y, zoom) {{
  const endpoints = [
    'server.arcgisonline.com',
    'services.arcgisonline.com'
  ];
  const endpoint = endpoints[(x + y) % endpoints.length];
  return `https://${{endpoint}}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${{zoom}}/${{y}}/${{x}}`;
}}

// Download a single tile
function downloadTile(x, y, zoom, outputDir) {{
  return new Promise((resolve, reject) => {{
    const url = getEsriTileUrl(x, y, zoom);
    const urlObj = new URL(url);
    const filename = path.join(outputDir, `${{zoom}}_${{x}}_${{y}}.png`);
    
    // Skip if already exists
    if (fs.existsSync(filename)) {{
      resolve({{ x, y, cached: true }});
      return;
    }}
    
    const options = {{
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      headers: {{
        'User-Agent': 'Mozilla/5.0 (compatible; TileDownloader/1.0)'
      }}
    }};
    
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {{
      if (res.statusCode === 200) {{
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('finish', () => {{
          fileStream.close();
          resolve({{ x, y, success: true }});
        }});
      }} else if (res.statusCode === 404) {{
        resolve({{ x, y, placeholder: true }});
      }} else {{
        reject(new Error(`HTTP ${{res.statusCode}} for tile ${{x}}/${{y}}`));
      }}
    }});
    
    req.on('error', (error) => {{
      reject(error);
    }});
    
    req.setTimeout(10000, () => {{
      req.destroy();
      reject(new Error(`Timeout downloading tile ${{x}}/${{y}}`));
    }});
    
    req.end();
  }});
}}

// Calculate required tiles
function getRequiredTiles(zoom, radiusKm) {{
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
  
  for (let x = minX; x <= maxX; x++) {{
    for (let y = minY; y <= maxY; y++) {{
      tiles.push({{ x, y }});
    }}
  }}
  
  return tiles;
}}

// Main download function
async function main() {{
  // Create output directory
  if (!fs.existsSync(TILES_DIR)) {{
    fs.mkdirSync(TILES_DIR, {{ recursive: true }});
  }}
  
  const tiles = getRequiredTiles(ZOOM, RADIUS_KM);
  console.log(`Downloading ${{tiles.length}} tiles...`);
  
  let downloaded = 0;
  let failed = 0;
  let cached = 0;
  const concurrency = 5;
  
  for (let i = 0; i < tiles.length; i += concurrency) {{
    const batch = tiles.slice(i, i + concurrency);
    const promises = batch.map(tile => 
      downloadTile(tile.x, tile.y, ZOOM, TILES_DIR)
        .catch(error => {{
          return {{ x: tile.x, y: tile.y, failed: true }};
        }})
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {{
      if (result.cached) cached++;
      else if (result.success) downloaded++;
      else if (result.failed) failed++;
    }});
    
    if ((downloaded + cached) % 50 === 0) {{
      const progress = ((i + batch.length) / tiles.length * 100).toFixed(1);
      console.log(`Progress: ${{progress}}% (${{downloaded}} downloaded, ${{cached}} cached, ${{failed}} failed)`);
    }}
  }}
  
  console.log(`\\n✓ Download complete: ${{downloaded}} downloaded, ${{cached}} cached, ${{failed}} failed`);
}}

main().catch(error => {{
  console.error('Fatal error:', error);
  process.exit(1);
}});
"""
    
    # Write temporary script
    temp_script.write_text(script_content)
    temp_script.chmod(0o755)
    
    try:
        # Run the Node.js script
        print(f"Running tile download script...")
        result = subprocess.run(
            ['node', str(temp_script)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(result.stdout)
            print("✓ Satellite tiles downloaded successfully!")
            return True
        else:
            print(f"✗ Error downloading tiles:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"✗ Error running tile download: {e}")
        return False
    finally:
        # Clean up temporary script
        if temp_script.exists():
            temp_script.unlink()

def process_dem_to_heightmap(input_path, output_path):
    """Process DEM GeoTIFF to heightmap PNG"""
    print(f"\n{'='*60}")
    print("⚙️  Processing DEM to Heightmap")
    print(f"{'='*60}")
    
    process_script = SCRIPTS_DIR / "process-dem-to-heightmap.py"
    
    if not process_script.exists():
        print("✗ Error: process-dem-to-heightmap.py not found!")
        return False
    
    try:
        result = subprocess.run(
            ['python3', str(process_script), str(input_path), str(output_path)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(result.stdout)
            print("✓ Heightmap processed successfully!")
            return True
        else:
            print(f"✗ Error processing DEM:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"✗ Error running DEM processor: {e}")
        return False

def stitch_satellite_tiles(output_path, size='medium'):
    """Stitch satellite tiles into a single texture image"""
    print(f"\n{'='*60}")
    print("🖼️  Stitching Satellite Tiles into Texture")
    print(f"{'='*60}")
    
    stitch_script = SCRIPTS_DIR / "tiles-to-image.py"
    
    if not stitch_script.exists():
        print("✗ Error: tiles-to-image.py not found!")
        return False
    
    try:
        result = subprocess.run(
            ['python3', str(stitch_script), '--size', size, '--output', str(output_path)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(result.stdout)
            print("✓ Satellite texture created successfully!")
            return True
        else:
            print(f"✗ Error stitching tiles:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"✗ Error running tile stitcher: {e}")
        return False

def main():
    """Main function"""
    print("="*60)
    print("🗺️  Terrain Data Downloader")
    print("="*60)
    print(f"Coordinates: 52°56'13.7\"S 70°50'58.7\"W")
    print(f"Decimal: {TERRAIN_CENTER['lat']}°, {TERRAIN_CENTER['lng']}°")
    print(f"Location: Punta Arenas, Chile")
    
    # Get API key
    api_key = os.getenv('OPENTOPOGRAPHY_API_KEY')
    if not api_key and len(sys.argv) >= 2:
        api_key = sys.argv[1]
    
    if not api_key:
        print("\n✗ Error: OpenTopography API key required!")
        print("\nOptions:")
        print("  1. Set environment variable: export OPENTOPOGRAPHY_API_KEY=your_key")
        print("  2. Or pass as argument: python scripts/download-terrain-data.py YOUR_API_KEY")
        print("\nGet your API key from: https://portal.opentopography.org/apidocs/")
        sys.exit(1)
    
    # Get radius
    radius_km = DEFAULT_RADIUS_KM
    if len(sys.argv) >= 3:
        try:
            radius_km = float(sys.argv[2])
        except ValueError:
            print(f"⚠️  Invalid radius, using default: {DEFAULT_RADIUS_KM} km")
    
    print(f"\nRadius: {radius_km} km")
    
    # Calculate bounds
    bounds = calculate_bounds(TERRAIN_CENTER['lat'], TERRAIN_CENTER['lng'], radius_km)
    
    # Create output directories
    TERRAIN_DIR.mkdir(parents=True, exist_ok=True)
    TILES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Download DEM
    raw_dem_path = TERRAIN_DIR / "raw-dem-punta-arenas.tif"
    if not download_dem(api_key, bounds, raw_dem_path):
        print("\n✗ Failed to download DEM. Exiting.")
        sys.exit(1)
    
    # Step 2: Process DEM to heightmap
    heightmap_path = TERRAIN_DIR / "punta-arenas-heightmap.png"
    if not process_dem_to_heightmap(raw_dem_path, heightmap_path):
        print("\n⚠️  Failed to process DEM, but continuing with satellite tiles...")
    
    # Step 3: Download satellite tiles
    if not download_satellite_tiles(TERRAIN_CENTER['lat'], TERRAIN_CENTER['lng'], radius_km):
        print("\n⚠️  Failed to download satellite tiles, but continuing...")
    
    # Step 4: Stitch satellite tiles into texture
    texture_path = TERRAIN_DIR / "punta-arenas-texture.png"
    if not stitch_satellite_tiles(texture_path, 'medium'):
        print("\n⚠️  Failed to stitch satellite tiles, but DEM processing completed.")
    
    # Summary
    print(f"\n{'='*60}")
    print("✅ Download Complete!")
    print(f"{'='*60}")
    print(f"\n📁 Output files:")
    if heightmap_path.exists():
        size_mb = heightmap_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ Heightmap: {heightmap_path} ({size_mb:.2f} MB)")
    if texture_path.exists():
        size_mb = texture_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ Texture: {texture_path} ({size_mb:.2f} MB)")
    if raw_dem_path.exists():
        size_mb = raw_dem_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ Raw DEM: {raw_dem_path} ({size_mb:.2f} MB)")
    
    print(f"\n💡 Next steps:")
    print(f"  1. Use the heightmap in your 3D terrain component")
    print(f"  2. Use the texture for realistic terrain rendering")
    print(f"  3. Adjust heightScale in your terrain component if needed")

if __name__ == "__main__":
    main()
