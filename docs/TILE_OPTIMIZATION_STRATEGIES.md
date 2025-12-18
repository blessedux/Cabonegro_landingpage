# Satellite Tile Optimization Strategies

## Current Situation

- **5,287 tiles** downloaded (~22 MB total)
- **~2.4 KB per tile** (256×256 PNG)
- Tiles are composited into a **single 4096×4096 canvas** once
- Final texture is **one GPU texture** (efficient for rendering)

## Performance Impact Analysis

### ✅ Good News

1. **Single GPU Texture**: All tiles are composited into one texture, so only ONE texture is used in the GPU (very efficient)
2. **One-Time Operation**: Tiles are loaded and composited once when the component mounts
3. **Small Individual Files**: ~2.4 KB per tile is well-compressed
4. **Total Size**: 22 MB is reasonable for a modern website

### ⚠️ Potential Concerns

1. **Many HTTP Requests**: 5,287 individual files = 5,287 HTTP requests

   - Even with parallel loading (8 concurrent), this takes time
   - Browser connection limits (typically 6-8 per domain)
   - Network latency adds up

2. **Initial Load Time**:

   - First-time visitors: ~5-10 seconds to load all tiles
   - Subsequent visits: Browser cache helps significantly

3. **Bundle Size**: 22 MB in `public/` means it's deployed with your site
   - Increases deployment size
   - Takes longer to deploy/upload

## Optimization Strategies

### Option 1: Create Sprite Atlas (RECOMMENDED)

Combine tiles into larger sprite sheets (e.g., 10×10 tiles per sheet = 2,560×2,560px).

**Benefits:**

- Reduces HTTP requests from 5,287 to ~50-100
- Faster initial load
- Better browser caching
- Same final result

**Trade-offs:**

- Need to update tile loading code
- Slightly more complex coordinate mapping

### Option 2: Use WebP Format

Convert PNG tiles to WebP (typically 25-35% smaller).

**Benefits:**

- Reduces total size from 22 MB to ~14-16 MB
- Same number of requests, but smaller files
- Modern browsers support WebP

**Trade-offs:**

- Need conversion script
- Older browser fallback needed

### Option 3: Progressive Loading

Load tiles in priority order (center first, edges last).

**Benefits:**

- Terrain appears faster (center visible first)
- Better perceived performance
- Can show loading progress

**Trade-offs:**

- More complex loading logic
- Slight visual "pop-in" as edges load

### Option 4: CDN + Compression

Serve tiles from CDN with gzip/brotli compression.

**Benefits:**

- Faster delivery
- Better caching
- Reduced server load

**Trade-offs:**

- Requires CDN setup
- Additional cost (if not free tier)

### Option 5: Lazy Load on Map Page Only

Only load tiles when user visits `/map` page.

**Benefits:**

- Doesn't affect homepage performance
- Faster initial site load

**Trade-offs:**

- Map page still has the same load time
- Already implemented (tiles load in component)

## Recommended Approach

### For Now (Quick Win)

1. **Keep current setup** - It works and 22 MB is acceptable
2. **Monitor performance** - Check Network tab in DevTools
3. **Use browser caching** - Tiles are static, cache well

### If Performance Becomes Issue

1. **Create sprite atlas** (Option 1) - Biggest impact
2. **Convert to WebP** (Option 2) - Easy win
3. **Add loading indicator** - Better UX during load

## Performance Metrics to Monitor

- **Time to First Tile**: How long until first tile loads?
- **Time to Complete**: How long until all tiles are composited?
- **Network Requests**: Count of tile requests
- **Total Transfer**: Size of all tile downloads
- **Canvas Creation Time**: Time to composite tiles

## Current Implementation Details

The tiles are loaded in `src/lib/terrain/map-tiles.ts`:

- 8 concurrent requests (good balance)
- Local tiles tried first, then online fallback
- Composited into 4096×4096 canvas
- Converted to THREE.js texture

This is already well-optimized for the current approach!

## Conclusion

**Your current setup is reasonable for a production site.** The 22 MB and 5,287 requests are acceptable trade-offs for:

- ✅ Reliable offline functionality
- ✅ No external API dependencies
- ✅ High-quality satellite imagery
- ✅ Single GPU texture (efficient rendering)

**Consider optimization only if:**

- Users report slow loading
- Analytics show high bounce rate on map page
- You need to reduce hosting costs
