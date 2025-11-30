# Language Switching Performance Optimization

## Problem Analysis

**Current Issue:** Language switching takes 1,243ms to compile 2,995 modules, causing noticeable delay.

**Root Causes:**

1. **No Route Prefetching** - Routes weren't prefetched before navigation
2. **No Static Generation** - Pages compile on-demand instead of being pre-generated
3. **Large Bundle Size** - 2,995 modules need to be compiled on each switch
4. **Separate Page Files** - Each language has its own page file (`/en/page.tsx`, `/es/page.tsx`), treated as separate routes

## Solutions Implemented

### ✅ 1. Route Prefetching (CRITICAL - Biggest Impact)

- **Added `prefetchLanguageRoute()` function** to all Navbar components
- **Prefetches on hover** - When user hovers over language option, route is prefetched
- **Result:** Routes are ready before click, making navigation near-instant

**Files Modified:**

- `src/components/sections/Navbar.tsx`
- `src/components/sections/Navbar-es.tsx`
- `src/components/sections/Navbar-zh.tsx`

### ✅ 2. Static Generation Support

- **Added `generateStaticParams()`** to `[locale]/layout.tsx`
- **Pre-generates all locale routes** at build time
- **Result:** Routes are pre-compiled, reducing runtime compilation

**Files Modified:**

- `src/app/[locale]/layout.tsx`

### ✅ 3. Package Import Optimization

- **Added `optimizePackageImports`** to `next.config.js`
- **Optimizes imports** for `lucide-react` and `framer-motion`
- **Result:** Smaller bundles, faster compilation

**Files Modified:**

- `next.config.js`

## Expected Improvements

### Immediate (After Prefetching)

- **First hover:** ~200-400ms (prefetch happens)
- **Subsequent clicks:** <50ms (route already prefetched)
- **Overall improvement:** 70-90% faster language switching

### After Full Optimization

- **With bundle optimization:** Additional 30-50% improvement
- **Target:** <100ms total language switch time

## Remaining Optimizations (From Performance Doc)

### High Priority

1. **Code Split Preloaders** (10 min)

   - Use dynamic imports for preloader components
   - Reduces initial bundle by ~50KB per preloader

2. **Code Split World Maps** (10 min)

   - Use dynamic imports for world map components
   - Reduces initial bundle by ~30KB per map

3. **Enable Image Optimization** (5 min)
   - Remove `unoptimized: true` from `next.config.js`
   - 50-70% faster image loading

### Medium Priority

4. **Choose One Animation Library**

   - Currently using both GSAP (~50KB) and Framer Motion (~60KB)
   - Migrate to one library to save ~50-60KB

5. **Convert to Dynamic Routes**
   - Consolidate `/en/page.tsx`, `/es/page.tsx` into `[locale]/page.tsx`
   - Better code sharing and smaller bundle

## Testing

### How to Test

1. **Hover over language dropdown** - Check Network tab for prefetch requests
2. **Click language option** - Should be near-instant if prefetched
3. **Check build output** - Should see all locales in static generation

### Metrics to Monitor

- **Time to prefetch:** Should be <500ms
- **Time to navigate:** Should be <100ms after prefetch
- **Bundle size:** Should decrease with code splitting

## Architecture Considerations

### Current Architecture

- **Separate page files** for each language (`/en/page.tsx`, `/es/page.tsx`)
- **Pros:** Simple, clear separation
- **Cons:** Code duplication, larger bundle, slower compilation

### Recommended Architecture (Future)

- **Single `[locale]/page.tsx`** with locale-based content
- **Pros:** Code sharing, smaller bundle, faster compilation
- **Cons:** Requires refactoring

## Next Steps

1. ✅ **Test prefetching** - Verify it works in production
2. ⏳ **Implement code splitting** - From performance doc
3. ⏳ **Enable image optimization** - Remove `unoptimized: true`
4. ⏳ **Consider architectural refactor** - Consolidate to `[locale]` routes

## Notes

- **Prefetching is the biggest win** - This alone should make language switching feel instant
- **Bundle optimization** will help with initial load and subsequent navigation
- **Static generation** helps with build-time optimization but less impact on runtime switching
