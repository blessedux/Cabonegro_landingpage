const createNextIntlPlugin = require('next-intl/plugin');

// Bundle analyzer is optional - only load if available
let withBundleAnalyzer = (config) => config;
try {
  const bundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  withBundleAnalyzer = bundleAnalyzer;
} catch (error) {
  // Bundle analyzer not installed, skip it
  console.warn('@next/bundle-analyzer not found, skipping bundle analysis');
}

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@mdi/react', 'react-icons', 'd3', 'three', 'leaflet'],
  },
  // Reduce bundle size
  // Note: swcMinify is enabled by default in Next.js 15, no need to specify
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Note: domains is deprecated, using remotePatterns instead
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Rewrites for /explore route - proxies external map deployment
  // This allows the map to be served from the same domain while keeping repos separate
  async rewrites() {
    let externalMapUrl = process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL || 'https://your-map-deployment.vercel.app'
    
    // Ensure URL has protocol prefix (required by Next.js rewrites)
    if (!externalMapUrl.startsWith('http://') && !externalMapUrl.startsWith('https://')) {
      externalMapUrl = `https://${externalMapUrl}`
    }
    
    return [
      // IMPORTANT: Asset rewrites must come BEFORE the main explore routes
      // to ensure they're matched first. Next.js evaluates rewrites in order.
      
      // Proxy Next.js root-level assets (index-*.js, index-*.css)
      // These are typically only used by Next.js apps and unlikely to conflict with our own assets
      // Our own Next.js app serves assets from /_next/static/, not root level
      {
        source: '/index-:hash.js',
        destination: `${externalMapUrl}/index-:hash.js`,
      },
      {
        source: '/index-:hash.css',
        destination: `${externalMapUrl}/index-:hash.css`,
      },
      // Proxy specific assets that the external app might reference
      {
        source: '/CaboNegro_logo_white.png',
        destination: `${externalMapUrl}/CaboNegro_logo_white.png`,
      },
      // Main explore routes (must come after asset rewrites)
      {
        source: '/:locale/explore/:path*',
        destination: `${externalMapUrl}/:path*`,
      },
      {
        source: '/:locale/explore',
        destination: `${externalMapUrl}`,
      },
      {
        source: '/explore/:path*',
        destination: `${externalMapUrl}/:path*`,
      },
      {
        source: '/explore',
        destination: `${externalMapUrl}`,
      },
      // Note: /_next/static and /_next/image are handled by Next.js internally
      // and cannot be rewritten. The external app should use absolute URLs for these
      // OR we need to handle them differently (e.g., via middleware)
    ]
  },
  async headers() {
    const externalMapUrl = process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL || 'https://your-map-deployment.vercel.app'
    let externalMapHost = externalMapUrl
    if (!externalMapHost.startsWith('http://') && !externalMapHost.startsWith('https://')) {
      externalMapHost = `https://${externalMapHost}`
    }
    // Extract hostname from URL for CSP
    try {
      const url = new URL(externalMapHost)
      externalMapHost = url.hostname
    } catch (e) {
      // If URL parsing fails, use as-is
    }

    const exploreCSP = `frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app https://vercel.live; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://my.spline.design https://*.spline.design https://vercel.live https://*.vercel.live https://${externalMapHost}; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com https://fonts.googleapis.com https://${externalMapHost}; font-src 'self' https://fonts.cdnfonts.com https://fonts.gstatic.com https://${externalMapHost}; img-src 'self' data: https: blob:; connect-src 'self' https://my.spline.design https://*.spline.design https://raw.githubusercontent.com https://vercel.live https://*.vercel.live https://${externalMapHost} blob:;`

    return [
      {
        // Apply stricter CSP to /explore routes to allow external app resources
        source: '/:locale/explore/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: exploreCSP
          },
          {
            key: 'Link',
            value: '<https://fonts.cdnfonts.com>; rel=preconnect; crossorigin, <https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          }
        ]
      },
      {
        // Apply CSP to /:locale/explore (root explore route with locale)
        source: '/:locale/explore',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: exploreCSP
          },
          {
            key: 'Link',
            value: '<https://fonts.cdnfonts.com>; rel=preconnect; crossorigin, <https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          }
        ]
      },
      {
        // Apply stricter CSP to /explore routes (non-localized with path)
        source: '/explore/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: exploreCSP
          },
          {
            key: 'Link',
            value: '<https://fonts.cdnfonts.com>; rel=preconnect; crossorigin, <https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          }
        ]
      },
      {
        // Apply CSP to /explore (root explore route)
        source: '/explore',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: exploreCSP
          },
          {
            key: 'Link',
            value: '<https://fonts.cdnfonts.com>; rel=preconnect; crossorigin, <https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          }
        ]
      },
      {
        // Default CSP for all other routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://my.spline.design https://*.spline.design; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com https://fonts.googleapis.com; font-src 'self' https://fonts.cdnfonts.com https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://my.spline.design https://*.spline.design https://raw.githubusercontent.com blob:;"
          },
          {
            key: 'Link',
            value: '<https://fonts.cdnfonts.com>; rel=preconnect; crossorigin, <https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          }
        ]
      }
    ]
  }
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
