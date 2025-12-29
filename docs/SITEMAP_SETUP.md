# Sitemap and Robots.txt Setup for Google Search Console

## Overview

This document explains the sitemap and robots.txt configuration for the Cabo Negro landing page to enable proper indexing by Google Search Console.

## Files Created

### 1. `src/app/sitemap.ts`
- **Location**: Automatically generates `/sitemap.xml` at the root of your site
- **Format**: Next.js 15 App Router sitemap format
- **Coverage**: All public routes across all locales (en, es, zh, fr)

### 2. `src/app/robots.ts`
- **Location**: Automatically generates `/robots.txt` at the root of your site
- **Purpose**: Tells search engines which pages to crawl and which to ignore

## Included Routes

The sitemap includes the following public routes for all 4 locales:

- `/` (Home page) - Priority: 1.0, Change Frequency: daily
- `/contact` - Priority: 0.9, Change Frequency: weekly
- `/deck` - Priority: 0.8, Change Frequency: weekly
- `/gallery` - Priority: 0.8, Change Frequency: weekly
- `/parque-logistico` - Priority: 0.8, Change Frequency: weekly
- `/parque-tecnologico` - Priority: 0.8, Change Frequency: weekly
- `/partners` - Priority: 0.8, Change Frequency: weekly
- `/terminal-maritimo` - Priority: 0.8, Change Frequency: weekly

**Total URLs in sitemap**: 32 (8 routes × 4 locales)

## Excluded Routes

The following routes are excluded from the sitemap (test/development routes):
- `/test-tiles`
- `/preloader-test`
- `/layout-preloader-test`
- `/procedural-terrain-test`
- `/gallery-backup`
- `/footer2`
- `/basic`
- `/scene-3d`
- `/investors-deck`
- `/api/*` (API routes)
- `/_next/*` (Next.js internal routes)

## Base URL Configuration

The sitemap uses the following priority for base URL:
1. `NEXT_PUBLIC_SITE_URL` environment variable (if set)
2. `VERCEL_URL` environment variable (automatically set by Vercel)
3. Default: `https://www.cabonegro.cl`

### Setting the Base URL

**For Production (Vercel)**:
- Vercel automatically sets `VERCEL_URL`, so no action needed
- Optionally, set `NEXT_PUBLIC_SITE_URL=https://www.cabonegro.cl` in Vercel project settings for consistency

**For Local Development**:
- Create `.env.local`:
  ```bash
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

## Testing the Sitemap

### 1. Build and Test Locally
```bash
npm run build
npm start
```

Then visit:
- `http://localhost:3000/sitemap.xml`
- `http://localhost:3000/robots.txt`

### 2. Verify in Production
After deployment, verify:
- `https://www.cabonegro.cl/sitemap.xml`
- `https://www.cabonegro.cl/robots.txt`

### 3. Validate Sitemap
Use Google's sitemap validator:
- [Google Search Console Sitemap Validator](https://search.google.com/search-console)
- Or use online tools like [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)

## Google Search Console Setup

### Step 1: Submit Sitemap
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (www.cabonegro.cl)
3. Navigate to **Sitemaps** in the left sidebar
4. Enter `sitemap.xml` in the "Add a new sitemap" field
5. Click **Submit**

### Step 2: Verify Robots.txt
1. In Google Search Console, go to **Settings** → **robots.txt Tester**
2. Verify that `/robots.txt` is accessible
3. Check that it references your sitemap correctly

### Step 3: Monitor Indexing
1. Go to **Coverage** report in Google Search Console
2. Monitor which pages are indexed
3. Check for any crawl errors

## Sitemap Features

### Multi-language Support
- Each URL includes `alternates` with all language versions
- Helps Google understand language variations
- Improves SEO for international audiences

### Priority and Change Frequency
- **Home pages**: Priority 1.0, updated daily
- **Contact page**: Priority 0.9, updated weekly
- **Other pages**: Priority 0.8, updated weekly

### Automatic Updates
- `lastModified` is set to current date on each build
- Sitemap regenerates on every deployment
- Always reflects current site structure

## Troubleshooting

### Sitemap Not Accessible
1. **Check build**: Ensure `npm run build` completes successfully
2. **Check route**: Verify `/sitemap.xml` is accessible in production
3. **Check base URL**: Verify `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL` is set correctly

### Google Not Indexing Pages
1. **Wait**: Google can take days/weeks to crawl new sitemaps
2. **Check robots.txt**: Ensure pages aren't blocked
3. **Request indexing**: Use "Request Indexing" in Google Search Console for important pages
4. **Check coverage report**: Look for errors in Google Search Console

### Sitemap Errors in Google Search Console
1. **Validate XML**: Use an XML validator to check format
2. **Check URLs**: Ensure all URLs are absolute (include https://)
3. **Check size**: Sitemaps should be < 50MB and < 50,000 URLs (we're well under both)

## Next Steps

1. ✅ Deploy to production
2. ✅ Submit sitemap to Google Search Console
3. ✅ Monitor indexing status
4. ✅ Check for crawl errors
5. ✅ Optimize based on Search Console insights

## Additional Resources

- [Next.js Sitemap Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)

