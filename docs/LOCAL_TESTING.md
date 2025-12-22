# Local Testing Guide for /explore Route

## Testing Rewrites Locally

Next.js rewrites work differently in development vs production. Here's how to test them:

### 1. Set Environment Variable

Create or update `.env.local`:

```bash
NEXT_PUBLIC_EXTERNAL_MAP_URL=https://your-external-app.vercel.app
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Test Routes

Open in browser:
- `http://localhost:3000/explore`
- `http://localhost:3000/en/explore`
- `http://localhost:3000/es/explore`

### 4. Check Network Tab

In browser DevTools → Network tab:
- Look for requests to `/explore`, `/assets/`, `/index-*.js`, etc.
- Check if they're being proxied (status 200) or returning 404
- Check response headers for CSP

### 5. Verify Rewrites Are Working

The rewrites should proxy requests to your external app. If you see 404s:

1. **Check environment variable is loaded:**
   ```bash
   # In terminal, verify the variable is set
   echo $NEXT_PUBLIC_EXTERNAL_MAP_URL
   ```

2. **Restart dev server** after changing `.env.local`

3. **Check Next.js console** for rewrite errors

4. **Verify external app URL** is correct and accessible

### 6. Test Production Build Locally

To test production build (closer to Vercel):

```bash
# Build
npm run build

# Start production server
npm start
```

Then test the same routes.

## Common Issues

### Rewrites Not Working

- **Issue**: 404 errors for assets
- **Solution**: 
  - Verify `NEXT_PUBLIC_EXTERNAL_MAP_URL` is set correctly
  - Check that external app URL is accessible
  - Ensure rewrites are before catch-all patterns in `next.config.js`

### CSP Violations

- **Issue**: Scripts blocked by CSP
- **Solution**: 
  - Check browser console for exact CSP error
  - Verify CSP headers in Network tab → Response Headers
  - Ensure `vercel.live` and external app hostname are in CSP

### Button Not Clickable

- **Issue**: Button doesn't work on first load
- **Solution**:
  - Check `PageTransitionWrapper` isn't blocking pointer events
  - Verify button has `pointerEvents: 'auto'` style
  - Check if preloader is blocking interactions

## Debugging Tips

1. **Add console logs** in `next.config.js` rewrites function:
   ```javascript
   console.log('Rewriting:', source, '→', destination)
   ```

2. **Check Vercel logs** (in production):
   - Vercel Dashboard → Deployments → Functions Logs
   - Look for rewrite errors

3. **Use browser DevTools**:
   - Network tab: See all requests and their status
   - Console: See CSP violations and errors
   - Application → Headers: See response headers

4. **Test with curl**:
   ```bash
   curl -I http://localhost:3000/explore
   # Check response headers
   ```

## Production vs Development Differences

- **Development**: Rewrites work but may have different behavior
- **Production**: Rewrites work exactly as configured
- **Vercel**: Uses production build, so test with `npm run build && npm start`

