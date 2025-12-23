# Debugging 404 Asset Errors

## Understanding the Problem

404 errors mean the resources aren't being found. This is **NOT a CORS issue**. CORS errors would show:
- "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header is present"

## Step 1: Check What the External App Actually Serves

### Option A: Direct Access
1. Open your external app directly: `https://your-external-app.vercel.app`
2. Open browser DevTools → Network tab
3. Reload the page
4. Look at all the requests - note the exact paths:
   - `/index-78873486.js` or `/assets/index-78873486.js`?
   - `/index-bf53c341.css` or `/assets/index-bf53c341.css`?
   - `/CaboNegro_logo_white.png` - where is it located?

### Option B: Inspect HTML Source
1. Visit the external app directly
2. View page source (Right-click → View Page Source)
3. Search for the asset references:
   - Look for `<script src="...">` tags
   - Look for `<link rel="stylesheet" href="...">` tags
   - Look for `<img src="...">` tags
4. Note the exact paths used

### Option C: Use curl
```bash
# Get the HTML
curl https://your-external-app.vercel.app > external-app.html

# Search for asset references
grep -E '(src|href)=' external-app.html | grep -E '\.(js|css|png|jpg)'
```

## Step 2: Verify Rewrites Are Working

### Check if Rewrites Match

The current rewrites expect:
- `/index-:hash.js` → `${externalMapUrl}/index-:hash.js`
- `/index-:hash.css` → `${externalMapUrl}/index-:hash.css`
- `/assets/:path*` → `${externalMapUrl}/assets/:path*`

But the external app might be using:
- `/assets/index-78873486.js` (not `/index-78873486.js`)
- Or a different base path

### Test Rewrites Manually

1. **In browser DevTools → Network tab:**
   - Navigate to `/explore`
   - Find a 404 request (e.g., `/index-78873486.js`)
   - Click on it
   - Check the "Request URL" - is it being rewritten?
   - Check the "Response" - what does it say?

2. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → Functions
   - Look for rewrite errors or 404s

## Step 3: Common Issues and Fixes

### Issue 1: Assets are in `/assets/` folder
**Symptom:** Requests to `/index-*.js` return 404, but `/assets/index-*.js` works

**Fix:** The rewrite for `/assets/:path*` should catch this, but verify it's working.

### Issue 2: External app uses absolute URLs
**Symptom:** Assets reference `https://external-app.vercel.app/assets/...` directly

**Fix:** The external app needs to use relative paths, OR we need to rewrite the HTML response (complex).

### Issue 3: Rewrites not matching
**Symptom:** 404s for assets that should be rewritten

**Possible causes:**
- Environment variable not set correctly
- Rewrite patterns don't match the actual paths
- Next.js is handling the route before rewrites run

**Debug:**
```javascript
// Add to next.config.js rewrites function
console.log('External URL:', externalMapUrl)
console.log('Rewriting:', source, '→', destination)
```

### Issue 4: External app uses basePath
**Symptom:** External app configured with `basePath: '/some-path'` in next.config.js

**Fix:** Adjust rewrite destination:
```javascript
{
  source: '/explore/:path*',
  destination: `${externalMapUrl}/some-path/:path*`, // Add basePath
}
```

## Step 4: Quick Fix - Add More Flexible Rewrites

If assets are in different locations, add catch-all rewrites:

```javascript
// Add to next.config.js rewrites (before explore routes)
{
  source: '/:path(.*\\.(js|css|png|jpg|jpeg|webp|svg|ico|woff|woff2))',
  destination: `${externalMapUrl}/:path`,
  has: [
    {
      type: 'header',
      key: 'referer',
      value: '.*/explore.*',
    },
  ],
}
```

## Step 5: Verify Environment Variable

```bash
# Check if variable is set in Vercel
# Vercel Dashboard → Settings → Environment Variables

# For local testing
cat .env.local | grep NEXT_PUBLIC_EXTERNAL_MAP_URL
```

## Step 6: Test the External App Directly

1. Visit: `https://your-external-app.vercel.app`
2. Does it load correctly?
3. Do all assets load?
4. What paths do the assets use?

If the external app works directly but not through `/explore`, the issue is with the rewrites.

## Next Steps

Once you identify the exact paths the external app uses:
1. Update the rewrites in `next.config.js` to match
2. Test locally with `npm run build && npm start`
3. Deploy and verify
