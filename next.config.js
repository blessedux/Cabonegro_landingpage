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
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Rewrites config:', {
        externalMapUrl,
        hasEnvVar: !!process.env.NEXT_PUBLIC_EXTERNAL_MAP_URL
      })
    }
    
    return [
      // IMPORTANT: Asset rewrites must come BEFORE the main explore routes
      // to ensure they're matched first. Next.js evaluates rewrites in order.
      
      // Proxy assets folder from external app (catch-all for assets)
      // This handles /assets/index-*.js, /assets/index-*.css, etc.
      {
        source: '/assets/:path*',
        destination: `${externalMapUrl}/assets/:path*`,
      },
      // Proxy Next.js root-level assets (index-*.js, index-*.css)
      // These might be at root level OR in assets folder
      // :hash matches any string (alphanumeric + dashes typically)
      {
        source: '/index-:hash.js',
        destination: `${externalMapUrl}/index-:hash.js`,
      },
      {
        source: '/index-:hash.css',
        destination: `${externalMapUrl}/index-:hash.css`,
      },
      // Also try assets folder for index files (common Next.js pattern)
      {
        source: '/assets/index-:hash.js',
        destination: `${externalMapUrl}/assets/index-:hash.js`,
      },
      {
        source: '/assets/index-:hash.css',
        destination: `${externalMapUrl}/assets/index-:hash.css`,
      },
      // Proxy specific assets that the external app might reference
      {
        source: '/CaboNegro_logo_white.png',
        destination: `${externalMapUrl}/CaboNegro_logo_white.png`,
      },
      {
        source: '/assets/CaboNegro_logo_white.png',
        destination: `${externalMapUrl}/assets/CaboNegro_logo_white.png`,
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

    // Unified CSP that works for both regular routes and explore routes
    // Adding vercel.live to default CSP since it's needed for explore routes and not a security risk
    const unifiedCSP = `frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app https://vercel.live; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://my.spline.design https://*.spline.design https://vercel.live https://*.vercel.live https://${externalMapHost}; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com https://fonts.googleapis.com https://${externalMapHost}; font-src 'self' https://fonts.cdnfonts.com https://fonts.gstatic.com https://${externalMapHost}; img-src 'self' data: https: blob:; connect-src 'self' https://my.spline.design https://*.spline.design https://raw.githubusercontent.com https://vercel.live https://*.vercel.live https://${externalMapHost} blob:;`

    return [
      {
        // Apply unified CSP to all routes - simpler and more reliable
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: unifiedCSP
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
