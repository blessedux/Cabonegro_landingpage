# Download Satellite Tiles for Offline Use

## Problem

The 3D map requires internet connection to load satellite imagery tiles. If tiles fail to load (CORS, network issues), the terrain shows only elevation colors (brown/gray) instead of real satellite imagery.

## Solution

Download tiles locally and serve them from `/public/assets/tiles/`. The code will automatically use local tiles first, then fall back to online tiles if local ones don't exist.

## Quick Start

### 1. Download Tiles

```bash
# Download tiles for zoom level 13 (recommended)
node scripts/download-satellite-tiles.js 13

# Or specify custom output directory
node scripts/download-satellite-tiles.js 13 public/assets/tiles
```

### 2. Wait for Download

The script will:

- Calculate required tiles for 40km radius around Cabo Negro
- Download ~22,500 tiles (150x150 grid at zoom 13)
- Save them to `public/assets/tiles/` as `{zoom}_{x}_{y}.png`
- Show progress and statistics

### 3. Restart Dev Server

```bash
# Stop your dev server (Ctrl+C)
# Restart it
npm run dev
```

### 4. Verify

- Open `/map` page
- Check browser console - you should see `[MapTiles] ✓ Loaded local tile X/Y` messages
- Terrain should show satellite imagery instead of elevation colors

## Tile Details

### Zoom Levels

- **Zoom 12**: ~60m per pixel, ~5,600 tiles (faster download, lower detail)
- **Zoom 13**: ~30m per pixel, ~22,500 tiles (recommended, good balance)
- **Zoom 14**: ~15m per pixel, ~90,000 tiles (slow download, high detail)

### Storage Requirements

- **Zoom 13**: ~500MB - 1GB (depending on compression)
- **Zoom 14**: ~2GB - 4GB

### Download Time

- **Zoom 13**: ~30-60 minutes (depending on connection)
- **Zoom 14**: ~2-4 hours

## How It Works

1. **Local First**: Code checks `/assets/tiles/{zoom}_{x}_{y}.png` first
2. **Online Fallback**: If local tile doesn't exist, downloads from ESRI/Bing/Google
3. **Automatic**: No code changes needed - just download tiles and restart

## Troubleshooting

### Tiles Not Loading

```bash
# Check if tiles directory exists
ls public/assets/tiles/

# Check if tiles are there
ls public/assets/tiles/ | head -10

# Verify a tile manually
open public/assets/tiles/13_5601_2333.png
```

### Download Fails

- Check internet connection
- ESRI servers may rate limit - the script has delays built in
- Try downloading in smaller batches (modify script concurrency)

### Still Seeing Black/Elevation Colors

1. Check browser console for errors
2. Verify tiles are in correct location: `public/assets/tiles/`
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Check that `useSatellite` uniform is 1.0 (run diagnostic script)

## Advanced Usage

### Download Specific Zoom

```bash
node scripts/download-satellite-tiles.js 12  # Lower detail, faster
node scripts/download-satellite-tiles.js 14  # Higher detail, slower
```

### Resume Download

The script skips tiles that already exist, so you can:

- Stop download (Ctrl+C)
- Restart script - it will continue from where it left off

### Check Download Progress

```bash
# Count downloaded tiles
ls public/assets/tiles/ | wc -l

# Expected for zoom 13: ~22,500 tiles
```

## File Structure

```
public/
└── assets/
    └── tiles/
        ├── 13_5601_2333.png
        ├── 13_5601_2334.png
        └── ... (~22,500 files for zoom 13)
```

## Notes

- Tiles are cached - if you re-run the script, it skips existing tiles
- Tiles are served statically by Next.js from `public/` directory
- No API keys required for ESRI tiles
- Tiles are standard 256x256 PNG images

## Next Steps

After downloading tiles:

1. Commit tiles to git (if repository allows large files)
2. Or use Git LFS for tile storage
3. Or host tiles on CDN and update paths in code





