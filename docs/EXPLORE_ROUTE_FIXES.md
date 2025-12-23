# /explore Route - Final Fixes Applied

## Issues Identified

1. **404 Errors for Assets**: `/assets/index-78873486.js`, `/assets/index-bf53c341.css`, `/CaboNegro_logo_white.png`
2. **CSP Violations**: `https://vercel.live/_next-live/feedback/feedback.js` blocked by CSP

## Root Cause

The external app at `https://cabo-negro-flight-simulator.vercel.app/explore` uses:
- **Relative paths** for assets: `/assets/index-78873486.js` ✅ (should work with rewrites)
- **Absolute URLs** for scripts: `https://vercel.live/_next-live/feedback/feedback.js` (bypasses rewrites, needs CSP)

## Fixes Applied

### 1. CSP Fix
- Added `script-src-elem` directive specifically for `<script>` elements
- Includes `https://vercel.live` and `https://*.vercel.live` in both `script-src` and `script-src-elem`
- Applied to all routes via unified CSP

### 2. Rewrites Configuration
Rewrites are configured to proxy:
- `/assets/:path*` → `${externalMapUrl}/assets/:path*`
- `/index-:hash.js` → `${externalMapUrl}/index-:hash.js`
- `/index-:hash.css` → `${externalMapUrl}/index-:hash.css`
- `/CaboNegro_logo_white.png` → `${externalMapUrl}/CaboNegro_logo_white.png`

### 3. Environment Variable
**CRITICAL**: Ensure `NEXT_PUBLIC_EXTERNAL_MAP_URL` is set to:
```
https://cabo-negro-flight-simulator.vercel.app
```

## Verification Steps

1. **Check Environment Variable in Vercel**:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_EXTERNAL_MAP_URL=https://cabo-negro-flight-simulator.vercel.app`
   - Apply to all environments (Production, Preview, Development)

2. **Test the External App Directly**:
   - Visit: `https://cabo-negro-flight-simulator.vercel.app/explore`
   - Verify it loads correctly
   - Check Network tab for asset paths

3. **Test Through Proxy**:
   - Visit: `https://your-domain.com/explore`
   - Open DevTools → Network tab
   - Check if assets load (200 status) or return 404
   - Check Console for CSP violations

4. **Check Vercel Logs**:
   - Vercel Dashboard → Deployments → Latest → Functions
   - Look for rewrite errors or 404s
   - Check if `externalMapUrl` is logged correctly

## If 404s Persist

### Option 1: Verify Rewrites Are Working
Add to `next.config.js` rewrites function:
```javascript
console.log('🔧 Rewrite patterns:', {
  '/assets/:path*': `${externalMapUrl}/assets/:path*`,
  '/index-:hash.js': `${externalMapUrl}/index-:hash.js`,
})
```

### Option 2: Check if Assets Exist
Test directly:
```bash
curl -I https://cabo-negro-flight-simulator.vercel.app/assets/index-78873486.js
# Should return 200, not 404
```

### Option 3: Alternative Approach
If rewrites don't work, consider:
- Using an iframe to embed the external app
- Using middleware to rewrite HTML responses
- Configuring the external app with a basePath

## Current Status

✅ CSP fixed (added `script-src-elem` for vercel.live)
✅ Rewrites configured for all asset patterns
⚠️ Need to verify rewrites are actually being evaluated in production

## Next Steps

1. Deploy and test
2. Check Vercel function logs for rewrite activity
3. Verify assets load through Network tab
4. If still 404, check if Next.js is serving static files before checking rewrites

