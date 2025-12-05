# Performance Optimization Plan - Navigation Speed

## Current Issues Identified

### 1. Build Error (CRITICAL - Must Fix First)
- **Error**: `useRouter` not exported from `next-intl`
- **Fix**: Use `useRouter` from `next/navigation` instead
- **Status**: ✅ Fixed

### 2. Bundle Size Issues
- **First Load JS**: 103-172 KB (Target: < 100 KB)
- **Shared Chunks**: 103 KB
- **Middleware**: 45.4 KB (Too large)
- **Heavy Libraries**:
  - `d3`: ~200KB (used in rotating-earth)
  - `three.js`: ~500KB (if used)
  - `framer-motion`: ~60KB (used in 40+ components)
  - `gsap`: ~50KB (used in 15+ components)
  - Both animation libraries = ~110KB waste

### 3. Console Logging (95 instances)
- **Impact**: Slows down production builds and runtime
- **Fix**: Remove or conditionally log only in development

### 4. Navigation Performance Issues
- **Current**: Extremely slow navigation between locales
- **Root Causes**:
  - Too many console.logs slowing execution
  - Preloader duration too long (500ms + 300ms fade = 800ms)
  - Heavy components loading synchronously
  - No proper route prefetching

### 5. Code Splitting Issues
- Some components already code-split (good)
- But many heavy components still load immediately:
  - RotatingEarth (d3.js ~200KB) - now lazy loaded ✅
  - But still loads when scrolling near AboutUs
  - World maps are code-split ✅
  - But could be optimized further

## Optimization Plan

### Phase 1: Critical Fixes (Immediate)

#### 1.1 Fix Build Error
- ✅ Use `next/navigation` router instead of `next-intl` router
- ✅ Keep `useLocale` and `Link` from `next-intl`

#### 1.2 Remove Console Logs (Production)
- Remove or wrap all console.logs with `process.env.NODE_ENV === 'development'`
- **Files to update**: 23 files with 95 console statements
- **Expected improvement**: 10-20% faster execution

#### 1.3 Optimize Preloader Duration
- Reduce preloader duration from 500ms to 300ms
- Reduce fade-out from 300ms to 200ms
- **Total time saved**: 300ms per navigation

### Phase 2: Bundle Size Reduction

#### 2.1 Remove Duplicate Animation Libraries
- **Option A**: Remove GSAP, keep Framer Motion (recommended)
- **Option B**: Remove Framer Motion, keep GSAP
- **Savings**: ~50-60KB
- **Files affected**: 15+ components using GSAP

#### 2.2 Optimize Heavy Library Imports
- **d3.js**: Already lazy loaded in rotating-earth ✅
- **three.js**: Check if actually used, if not remove
- **leaflet**: Check if used, lazy load if needed

#### 2.3 Code Split More Components
- Lazy load CookieBanner
- Lazy load ScrollToTopButton
- Lazy load Footer (already done ✅)
- Lazy load Stats, Press, Partners (already done ✅)

### Phase 3: Navigation Speed Optimization

#### 3.1 Optimize Route Prefetching
- Ensure prefetching happens on hover (already implemented ✅)
- Add prefetching for all locale routes on page load
- Prefetch adjacent routes (next/prev locale)

#### 3.2 Reduce Preloader Overhead
- Show preloader only for language switches (already done ✅)
- Skip preloader for fast navigations (<100ms)
- Use CSS-only transitions (already done ✅)

#### 3.3 Optimize Middleware
- Middleware is 45.4 KB - investigate if can be reduced
- Check if all middleware logic is necessary

### Phase 4: Runtime Performance

#### 4.1 Remove Unnecessary Re-renders
- Memoize expensive computations
- Use React.memo for heavy components
- Optimize context providers

#### 4.2 Optimize Image Loading
- Ensure Next.js image optimization is enabled
- Use proper image sizes
- Lazy load images below fold

## Implementation Priority

### High Priority (Do First)
1. ✅ Fix build error (useRouter import)
2. Remove console.logs in production
3. Reduce preloader duration
4. Optimize route prefetching

### Medium Priority
5. Remove duplicate animation library (GSAP or Framer Motion)
6. Code split remaining heavy components
7. Optimize middleware size

### Low Priority
8. Further bundle optimizations
9. Advanced code splitting strategies

## Expected Results

### Navigation Speed
- **Before**: 800ms+ (preloader + navigation)
- **After**: <200ms (optimized preloader + prefetching)
- **Improvement**: 75% faster

### Bundle Size
- **Before**: 103-172 KB First Load JS
- **After**: 80-120 KB First Load JS
- **Improvement**: 20-30% reduction

### Build Performance
- **Before**: 4.4s compilation
- **After**: <3s compilation (with fewer logs)
- **Improvement**: 30% faster

## Metrics to Track

1. Navigation time between locales
2. First Load JS size per route
3. Build compilation time
4. Runtime console warnings/errors
5. Bundle analyzer output

