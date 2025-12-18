#!/usr/bin/env python3
"""
Download DEM data from OpenTopography API for Cabo Negro to Punta Arenas corridor
Requires: pip install requests rasterio numpy pillow

Usage:
    python scripts/download-dem-opentopography.py YOUR_API_KEY
"""

import sys
import os
import requests
from pathlib import Path

# Try to load environment variables from .env files (optional)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env.local'
    if env_path.exists():
        load_dotenv(env_path)
    else:
        # Try .env as fallback
        load_dotenv(Path(__file__).parent.parent / '.env')
except ImportError:
    # python-dotenv not installed, skip .env loading
    pass

# Center point: 53°03'40.4"S 70°52'42.2"W
# Converted to decimal: -53.061222, -70.878388
# 40km radius area
TERRAIN_CENTER = {
    'lat': -53.061222,
    'lng': -70.878388
}

# Calculate bounds for 40km radius
# At latitude -53°, 1 degree ≈ 111,320m latitude, ~66,960m longitude
# 40km = ~0.18° latitude, ~0.30° longitude
CORRIDOR_BOUNDS = {
    'south': TERRAIN_CENTER['lat'] - 0.18,  # ~20km south
    'north': TERRAIN_CENTER['lat'] + 0.18,  # ~20km north
    'west': TERRAIN_CENTER['lng'] - 0.30,   # ~20km west
    'east': TERRAIN_CENTER['lng'] + 0.30,   # ~20km east
}

# OpenTopography API endpoint
API_BASE_URL = "https://portal.opentopography.org/API/globaldem"

# Available DEM types (SRTMGL1 is 30m resolution, good for our use case)
# Options: SRTMGL1, SRTMGL3, AW3D30, NASADEM, COP30
DEM_TYPE = "SRTMGL1"  # SRTM Global 1 arc-second (30m resolution)

def download_dem(api_key: str, output_path: str = "public/assets/terrain/raw-dem.tif"):
    """
    Download DEM data from OpenTopography API
    
    Args:
        api_key: Your OpenTopography API key
        output_path: Path to save the downloaded GeoTIFF file
    """
    print(f"Downloading DEM data for Cabo Negro to Punta Arenas corridor...")
    print(f"Area: {CORRIDOR_BOUNDS['south']}° to {CORRIDOR_BOUNDS['north']}° lat, "
          f"{CORRIDOR_BOUNDS['west']}° to {CORRIDOR_BOUNDS['east']}° lng")
    
    # Construct API request parameters
    params = {
        'demtype': DEM_TYPE,
        'south': CORRIDOR_BOUNDS['south'],
        'north': CORRIDOR_BOUNDS['north'],
        'west': CORRIDOR_BOUNDS['west'],
        'east': CORRIDOR_BOUNDS['east'],
        'outputFormat': 'GTiff',
        'API_Key': api_key
    }
    
    print(f"\nRequesting DEM from OpenTopography API...")
    print(f"DEM Type: {DEM_TYPE}")
    print(f"URL: {API_BASE_URL}")
    
    try:
        # Make API request
        response = requests.get(API_BASE_URL, params=params, stream=True)
        
        if response.status_code == 200:
            # Create output directory if it doesn't exist
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Save the downloaded file
            print(f"\nDownloading to: {output_path}")
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            print(f"✓ DEM downloaded successfully!")
            print(f"  File size: {file_size:.2f} MB")
            print(f"  Location: {os.path.abspath(output_path)}")
            print(f"\nNext steps:")
            print(f"  1. Process the GeoTIFF using: python scripts/process-dem-to-heightmap.py")
            print(f"  2. Or use QGIS (see public/assets/terrain/DEM_PROCESSING_GUIDE.md)")
            print(f"  3. Or run the complete workflow: ./scripts/download-and-process.sh YOUR_API_KEY")
            
            return True
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Error downloading DEM: {e}")
        return False

def main():
    # Try to get API key from environment variable first, then command line
    api_key = os.getenv('OPENTOPOGRAPHY_API_KEY')
    
    if not api_key and len(sys.argv) >= 2:
        api_key = sys.argv[1]
    
    if not api_key:
        print("Error: API key not found!")
        print("\nOptions:")
        print("  1. Set environment variable: export OPENTOPOGRAPHY_API_KEY=your_key")
        print("  2. Or pass as argument: python scripts/download-dem-opentopography.py YOUR_API_KEY")
        print("\nGet your API key from: https://portal.opentopography.org/apidocs/")
        sys.exit(1)
    
    # Download DEM
    success = download_dem(api_key)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
