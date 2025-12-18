#!/usr/bin/env python3
"""
Create a low-resolution composite image from satellite tiles

This script:
1. Loads all PNG tiles from public/assets/tiles/
2. Composites them seamlessly into a single image (no grid lines)
3. Saves as a PNG image at specified resolution
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Optional

try:
    from PIL import Image
except ImportError as e:
    print("❌ Missing required packages.")
    print(f"   Error: {e}")
    print("   Install with: pip install pillow")
    print("   Or use the virtual environment: ./venv/bin/pip install pillow")
    exit(1)

# Configuration
TILES_DIR = Path(__file__).parent.parent / "public" / "assets" / "tiles"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "assets" / "terrain"
TILE_SIZE = 256  # Each tile is 256x256 pixels

# Default output sizes
DEFAULT_SIZES = {
    'ultra': 8192,
    'high': 4096,
    'medium': 2048,
    'low': 1024,
    'tiny': 512
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

def calculate_bounds(tiles: List[Dict]) -> Dict:
    """Calculate tile bounds"""
    if not tiles:
        return {'minX': 0, 'maxX': 0, 'minY': 0, 'maxY': 0}
    
    min_x = min(t['x'] for t in tiles)
    max_x = max(t['x'] for t in tiles)
    min_y = min(t['y'] for t in tiles)
    max_y = max(t['y'] for t in tiles)
    
    return {
        'minX': min_x,
        'maxX': max_x,
        'minY': min_y,
        'maxY': max_y
    }

def composite_tiles(tiles: List[Dict], bounds: Dict, output_width: int, output_height: int, show_progress: bool = True) -> Image.Image:
    """Load and composite tiles into a single seamless image"""
    print('🎨 Creating seamless composite image...')
    print(f'   Output size: {output_width}x{output_height} pixels')
    
    min_x = bounds['minX']
    max_x = bounds['maxX']
    min_y = bounds['minY']
    max_y = bounds['maxY']
    
    # Calculate original dimensions
    original_width = (max_x - min_x + 1) * TILE_SIZE
    original_height = (max_y - min_y + 1) * TILE_SIZE
    
    # Calculate scale factor
    scale_x = output_width / original_width
    scale_y = output_height / original_height
    scale = min(scale_x, scale_y)  # Maintain aspect ratio
    
    # Create canvas (RGB for seamless compositing)
    canvas = Image.new('RGB', (output_width, output_height), color='black')
    
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
            
            # Convert to RGB if needed (removes any alpha/transparency)
            if tile_img.mode != 'RGB':
                tile_img = tile_img.convert('RGB')
            
            # Calculate position in output image
            # Map from tile coordinates to output pixel coordinates
            atlas_x = int((tile['x'] - min_x) * TILE_SIZE * scale)
            atlas_y = int((tile['y'] - min_y) * TILE_SIZE * scale)
            scaled_size = int(TILE_SIZE * scale)
            
            # Resize tile to match output scale
            if scale != 1.0:
                tile_img = tile_img.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
            
            # Paste tile onto canvas - seamless compositing, no grid lines
            # Use the tile image directly, which will blend naturally
            canvas.paste(tile_img, (atlas_x, atlas_y))
            
            loaded += 1
            if show_progress and loaded % 100 == 0:
                progress_pct = loaded/total*100
                print(f'   Progress: {loaded}/{total} tiles ({progress_pct:.1f}%)')
        
        except Exception as e:
            failed += 1
            if failed <= 10:  # Only show first 10 errors
                print(f'   ⚠️  Failed to load {tile["filename"]}: {e}')
    
    print(f'✅ Composited {loaded}/{total} tiles into seamless image')
    if failed > 0:
        print(f'   ⚠️  {failed} tiles failed to load')
    
    return canvas

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Create a low-resolution composite image from satellite tiles',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f'''
Examples:
  python scripts/tiles-to-image.py                    # Default: 2048x2048
  python scripts/tiles-to-image.py --size 4096        # 4096x4096
  python scripts/tiles-to-image.py --size low         # 1024x1024 (preset)
  python scripts/tiles-to-image.py --size 512         # 512x512
  python scripts/tiles-to-image.py --width 1920 --height 1080  # Custom dimensions

Available presets: {", ".join(DEFAULT_SIZES.keys())}
        '''
    )
    
    parser.add_argument(
        '--size',
        type=str,
        default='medium',
        help=f'Output size (preset: {", ".join(DEFAULT_SIZES.keys())} or pixel value like 2048)'
    )
    parser.add_argument(
        '--width',
        type=int,
        help='Custom output width (overrides --size)'
    )
    parser.add_argument(
        '--height',
        type=int,
        help='Custom output height (overrides --size)'
    )
    parser.add_argument(
        '--output',
        type=str,
        help='Output filename (default: terrain-composite-{size}.png)'
    )
    parser.add_argument(
        '--quality',
        type=int,
        default=95,
        help='JPEG quality (1-100, default: 95). Only used if output is .jpg'
    )
    
    args = parser.parse_args()
    
    # Determine output dimensions
    if args.width and args.height:
        output_width = args.width
        output_height = args.height
    elif args.width:
        # Square if only width specified
        output_width = args.width
        output_height = args.width
    elif args.height:
        # Square if only height specified
        output_width = args.height
        output_height = args.height
    else:
        # Use preset or parse as number
        if args.size.lower() in DEFAULT_SIZES:
            output_width = DEFAULT_SIZES[args.size.lower()]
            output_height = DEFAULT_SIZES[args.size.lower()]
        else:
            try:
                output_width = int(args.size)
                output_height = int(args.size)
            except ValueError:
                print(f'❌ Invalid size: {args.size}')
                print(f'   Use a preset ({", ".join(DEFAULT_SIZES.keys())}) or a number')
                return 1
    
    # Determine output filename
    if args.output:
        output_file = Path(args.output)
        if not output_file.is_absolute():
            output_file = OUTPUT_DIR / output_file
    else:
        output_file = OUTPUT_DIR / f"terrain-composite-{output_width}x{output_height}.png"
    
    print('🚀 Starting tile to image conversion...')
    print(f'📊 Output size: {output_width}x{output_height} pixels\n')
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        # Step 1: Get all tiles
        tiles = get_all_tiles()
        if not tiles:
            print('❌ No tiles found!')
            return 1
        
        # Step 2: Calculate bounds
        bounds = calculate_bounds(tiles)
        print(f'\n📐 Tile bounds: x[{bounds["minX"]}, {bounds["maxX"]}], y[{bounds["minY"]}, {bounds["maxY"]}]')
        print(f'📐 Total tiles: {len(tiles)} ({bounds["maxX"] - bounds["minX"] + 1} × {bounds["maxY"] - bounds["minY"] + 1})\n')
        
        # Step 3: Composite tiles
        composite_image = composite_tiles(tiles, bounds, output_width, output_height)
        
        # Step 4: Save image
        print(f'\n💾 Saving image to {output_file}...')
        
        # Determine format from extension
        output_ext = output_file.suffix.lower()
        if output_ext == '.jpg' or output_ext == '.jpeg':
            composite_image.save(output_file, 'JPEG', quality=args.quality, optimize=True)
        else:
            # Default to PNG
            composite_image.save(output_file, 'PNG', optimize=True)
        
        file_size_mb = output_file.stat().st_size / 1024 / 1024
        print(f'✅ Image saved: {output_file} ({file_size_mb:.2f} MB)')
        
        print(f'\n📦 Output file:')
        print(f'   {output_file}')
        print(f'\n💡 Tip: Use different sizes:')
        print(f'   python scripts/tiles-to-image.py --size ultra  # 8192x8192')
        print(f'   python scripts/tiles-to-image.py --size high   # 4096x4096')
        print(f'   python scripts/tiles-to-image.py --size medium # 2048x2048 [default]')
        print(f'   python scripts/tiles-to-image.py --size low    # 1024x1024')
        print(f'   python scripts/tiles-to-image.py --size tiny   # 512x512')
        
    except Exception as error:
        print(f'❌ Error: {error}')
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())


