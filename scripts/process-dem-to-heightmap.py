#!/usr/bin/env python3
"""
Process downloaded DEM GeoTIFF into low-poly heightmap PNG
Requires: pip install rasterio numpy pillow

Usage:
    python scripts/process-dem-to-heightmap.py [input.tif] [output.png]
    
If no arguments provided, uses default paths:
    - Input: public/assets/terrain/raw-dem.tif
    - Output: public/assets/terrain/punta-arenas-cabonegro-heightmap.png
"""

import sys
import os
import numpy as np
from pathlib import Path
try:
    import rasterio
    from rasterio.transform import from_bounds
    from PIL import Image
    from scipy.ndimage import zoom
except ImportError as e:
    print("Error: Missing required packages.")
    print("Install with: pip install rasterio numpy pillow scipy")
    sys.exit(1)

# Default paths
DEFAULT_INPUT = "public/assets/terrain/raw-dem.tif"
DEFAULT_OUTPUT = "public/assets/terrain/punta-arenas-cabonegro-heightmap.png"

# Target dimensions for low-poly heightmap
TARGET_WIDTH = 1024
TARGET_HEIGHT = 1024

def process_dem_to_heightmap(
    input_path: str,
    output_path: str,
    target_width: int = TARGET_WIDTH,
    target_height: int = TARGET_HEIGHT
):
    """
    Process DEM GeoTIFF into normalized heightmap PNG
    
    Args:
        input_path: Path to input GeoTIFF file
        output_path: Path to output PNG heightmap
        target_width: Target width in pixels
        target_height: Target height in pixels
    """
    print(f"Processing DEM: {input_path}")
    print(f"Output: {output_path}")
    print(f"Target size: {target_width}x{target_height}")
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"✗ Error: Input file not found: {input_path}")
        return False
    
    try:
        # Open the GeoTIFF
        with rasterio.open(input_path) as src:
            print(f"\nSource DEM info:")
            print(f"  Size: {src.width}x{src.height}")
            print(f"  Bounds: {src.bounds}")
            print(f"  CRS: {src.crs}")
            
            # Read the DEM data (first band)
            dem_data = src.read(1)
            
            # Get no-data value
            no_data = src.nodata
            
            # Mask no-data values
            if no_data is not None:
                dem_data = np.ma.masked_array(dem_data, mask=(dem_data == no_data))
            
            print(f"\nElevation statistics:")
            print(f"  Min: {np.nanmin(dem_data):.2f} m")
            print(f"  Max: {np.nanmax(dem_data):.2f} m")
            print(f"  Mean: {np.nanmean(dem_data):.2f} m")
            
            # Resample to target size using bilinear interpolation
            print(f"\nResampling to {target_width}x{target_height}...")
            
            # Calculate zoom factors
            zoom_y = target_height / dem_data.shape[0]
            zoom_x = target_width / dem_data.shape[1]
            
            # Resample
            resampled = zoom(dem_data, (zoom_y, zoom_x), order=1)
            
            # Normalize to 0-255 range
            print("Normalizing height values...")
            min_height = np.nanmin(resampled)
            max_height = np.nanmax(resampled)
            
            print(f"  Normalized range: {min_height:.2f} to {max_height:.2f} m")
            
            # Normalize: (value - min) / (max - min) * 255
            normalized = ((resampled - min_height) / (max_height - min_height) * 255).astype(np.uint8)
            
            # Create output directory
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Save as PNG (grayscale)
            print(f"\nSaving heightmap PNG...")
            img = Image.fromarray(normalized, mode='L')
            img.save(output_path)
            
            file_size = os.path.getsize(output_path) / 1024  # KB
            print(f"✓ Heightmap created successfully!")
            print(f"  File size: {file_size:.2f} KB")
            print(f"  Location: {os.path.abspath(output_path)}")
            print(f"\nThe heightmap is ready to use in the 3D map!")
            print(f"  It will be automatically loaded by LowPolyTerrain component")
            
            return True
            
    except Exception as e:
        print(f"✗ Error processing DEM: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    # Get input/output paths from command line or use defaults
    if len(sys.argv) >= 2:
        input_path = sys.argv[1]
    else:
        input_path = DEFAULT_INPUT
    
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]
    else:
        output_path = DEFAULT_OUTPUT
    
    # Get resolution from command line or environment variable
    target_width = TARGET_WIDTH
    target_height = TARGET_HEIGHT
    
    if len(sys.argv) >= 4:
        try:
            target_width = int(sys.argv[3])
            target_height = int(sys.argv[3])  # Square by default
        except ValueError:
            print(f"⚠️  Invalid resolution, using default: {TARGET_WIDTH}x{TARGET_HEIGHT}")
    elif os.getenv('TARGET_RESOLUTION'):
        try:
            target_width = int(os.getenv('TARGET_RESOLUTION'))
            target_height = int(os.getenv('TARGET_RESOLUTION'))
        except ValueError:
            print(f"⚠️  Invalid TARGET_RESOLUTION env var, using default: {TARGET_WIDTH}x{TARGET_HEIGHT}")
    
    # Process the DEM
    success = process_dem_to_heightmap(input_path, output_path, target_width, target_height)
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
