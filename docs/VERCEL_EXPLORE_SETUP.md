# Vercel /explore Route Setup

This document explains how the `/explore` route is configured to proxy an external map deployment using Vercel rewrites.

## Overview

The `/explore` route uses Next.js rewrites to seamlessly proxy requests to an external map deployment. This allows both repositories to remain separate while providing a unified user experience on the same domain.

## Architecture

```
User Request → Vercel (Main Repo) → Rewrite Rule → External Map Deployment
     ↓
  /explore → Proxied to → map-deployment.vercel.app
```

## Configuration

### 1. Environment Variable

Add the external map deployment URL to your environment variables:

**Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_EXTERNAL_MAP_URL=https://your-map-deployment.vercel.app
```

**Vercel Project Settings**:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add `NEXT_PUBLIC_EXTERNAL_MAP_URL` with your map deployment URL
4. Apply to all environments (Production, Preview, Development)

### 2. Next.js Configuration

The rewrites are configured in `next.config.js`:

```javascript
async rewrites() {
  const externalMapUrl = process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL || 'https://your-map-deployment.vercel.app'
  
  return [
    {
      source: '/:locale/explore/:path*',
      destination: `${externalMapUrl}/:path*`,
    },
    {
      source: '/explore/:path*',
      destination: `${externalMapUrl}/:path*`,
    },
  ]
}
```

This configuration:
- Handles localized routes: `/:locale/explore` (e.g., `/en/explore`, `/es/explore`)
- Handles non-localized routes: `/explore`
- Proxies all sub-paths: `/:path*` (e.g., `/explore/some/path`)

## Deployment Steps

### Step 1: Deploy Map Repository

1. Deploy your map repository to Vercel
2. Note the deployment URL (e.g., `https://cabonegro-map.vercel.app`)
3. Ensure the map deployment is accessible and working

### Step 2: Configure Main Repository

1. Set `NEXT_PUBLIC_EXTERNAL_MAP_URL` in Vercel project settings
2. Deploy the main repository
3. The rewrites will automatically proxy `/explore` requests to the map deployment

### Step 3: Verify

1. Navigate to `https://your-domain.com/explore`
2. Navigate to `https://your-domain.com/en/explore`
3. Verify that the map loads correctly
4. Check that the URL stays as `/explore` (no redirect)

## How It Works

1. **User navigates to `/explore`**
   - Next.js receives the request
   - Rewrite rule matches the pattern
   - Request is proxied to external map deployment

2. **External deployment responds**
   - Map deployment processes the request
   - Returns HTML, assets, API responses
   - All responses are proxied back through Next.js

3. **User sees seamless experience**
   - URL remains as `/explore`
   - All assets load correctly
   - Appears as single application

## Benefits

- ✅ **Same Domain**: Map appears on same domain as main site
- ✅ **No Redirects**: URL stays as `/explore` (seamless UX)
- ✅ **Separate Repos**: Both repositories remain independent
- ✅ **Easy Updates**: Change env variable to point to different deployment
- ✅ **Edge Network**: Leverages Vercel's global edge network
- ✅ **SEO Friendly**: Single domain improves SEO

## Troubleshooting

### Map Not Loading

1. **Check Environment Variable**:
   ```bash
   # Verify in Vercel dashboard
   NEXT_PUBLIC_EXTERNAL_MAP_URL=https://your-map-deployment.vercel.app
   ```

2. **Verify Map Deployment**:
   - Ensure map deployment is accessible
   - Check map deployment logs for errors
   - Test direct access to map deployment URL

3. **Check Rewrites**:
   - Verify `next.config.js` has rewrites function
   - Check Vercel deployment logs for rewrite errors
   - Ensure rewrite patterns match your routes

### CORS Issues

If you encounter CORS errors:

1. **Check Map Deployment CORS Settings**:
   - Ensure map deployment allows requests from your domain
   - Configure CORS headers if needed

2. **Vercel Proxy**:
   - Rewrites should handle CORS automatically
   - If issues persist, check Vercel function logs

### Assets Not Loading

1. **Relative Paths**:
   - Ensure map deployment uses relative paths for assets
   - Absolute paths may break when proxied

2. **Base Path**:
   - Check if map deployment needs base path configuration
   - Adjust rewrite destination if needed

## Advanced Configuration

### Custom Path Mapping

If your map deployment uses different paths, adjust the rewrite:

```javascript
async rewrites() {
  const externalMapUrl = process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL
  
  return [
    {
      source: '/:locale/explore/:path*',
      destination: `${externalMapUrl}/custom-path/:path*`, // Custom path prefix
    },
  ]
}
```

### Conditional Rewrites

You can add conditions to rewrites:

```javascript
async rewrites() {
  const externalMapUrl = process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL
  
  return [
    {
      source: '/:locale/explore/:path*',
      destination: `${externalMapUrl}/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-custom-header',
          value: '(?<value>.*)',
        },
      ],
    },
  ]
}
```

## Testing

### Local Development

1. Set environment variable in `.env.local`:
   ```bash
   NEXT_PUBLIC_EXTERNAL_MAP_URL=https://your-map-deployment.vercel.app
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Test routes:
   - `http://localhost:3000/explore`
   - `http://localhost:3000/en/explore`
   - `http://localhost:3000/es/explore`

### Production Testing

1. Deploy to Vercel
2. Test all locale routes
3. Verify assets load correctly
4. Check browser console for errors
5. Test navigation from main site to `/explore`

## Maintenance

### Updating Map Deployment URL

1. Update `NEXT_PUBLIC_EXTERNAL_MAP_URL` in Vercel
2. Redeploy main repository
3. Rewrites will automatically use new URL

### Monitoring

- Check Vercel function logs for rewrite errors
- Monitor map deployment logs
- Use Vercel Analytics to track `/explore` route performance

## Related Files

- `next.config.js` - Rewrites configuration
- `src/components/sections/SimpleFooter.tsx` - Footer link to `/explore`
- `src/components/sections/UnifiedNavbar.tsx` - Navigation to `/explore`

