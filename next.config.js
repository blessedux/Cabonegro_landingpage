const createNextIntlPlugin = require('next-intl/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');

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

const cesiumSource = path.join(__dirname, 'node_modules/cesium/Build/Cesium');
const cesiumStaticDest = path.join(__dirname, '.next/static/cesium');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parent dirs may contain other lockfiles (e.g. pnpm); pin tracing to this app root.
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["*.preview.same-app.com"],
  env: {
    CESIUM_BASE_URL: '/_next/static/cesium',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Treat the cesium npm package as a global so webpack never bundles it
      // into a content-hashed chunk. We load the pre-built Cesium.js from
      // /_next/static/cesium/Cesium.js instead.
      config.externals = {
        ...(config.externals ?? {}),
        cesium: 'Cesium',
      };

      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { from: path.join(cesiumSource, 'Cesium.js'), to: path.join(cesiumStaticDest, 'Cesium.js') },
            { from: path.join(cesiumSource, 'Workers'), to: path.join(cesiumStaticDest, 'Workers') },
            { from: path.join(cesiumSource, 'ThirdParty'), to: path.join(cesiumStaticDest, 'ThirdParty') },
            { from: path.join(cesiumSource, 'Assets'), to: path.join(cesiumStaticDest, 'Assets') },
            { from: path.join(cesiumSource, 'Widgets'), to: path.join(cesiumStaticDest, 'Widgets') },
          ],
        })
      );

      // Some Cesium builds embed WASM byte strings in template literals using
      // `\\00` which browsers reject ("Octal escape sequences are not allowed in template strings").
      // Normalize `\\00` → `\\0` in the copied Cesium.js so it parses everywhere.
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CesiumTemplateEscapeFix', () => {
            try {
              const outPath = path.join(cesiumStaticDest, 'Cesium.js');
              if (!fs.existsSync(outPath)) return;
              const src = fs.readFileSync(outPath, 'utf8');
              if (!src.includes('\\00') && !src.includes('\\000')) return;
              // Collapse \00 and \000 to \0 (octal escapes are rejected in template strings).
              // Do it to a fixed point because collapsing \000 -> \0 can reveal a new \00.
              let next = src;
              for (let i = 0; i < 5; i++) {
                const prev = next;
                next = next.replaceAll('\\000', '\\0').replaceAll('\\00', '\\0');
                if (next === prev) break;
              }
              fs.writeFileSync(outPath, next, 'utf8');
            } catch {
              // Non-fatal: worst case Cesium parse error will surface in the console.
            }
          });
        },
      });

      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@mdi/react', 'react-icons', 'd3-geo', 'd3-timer'],
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
  async headers() {
    const debugConnect =
      process.env.NODE_ENV === 'development'
        ? " http://127.0.0.1:7887 http://localhost:7887"
        : ''

    const csp = `frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app https://vercel.live; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://my.spline.design https://*.spline.design https://vercel.live https://*.vercel.live https://cesium.com https://*.cesium.com; script-src-elem 'self' 'unsafe-inline' blob: https://my.spline.design https://*.spline.design https://vercel.live https://*.vercel.live https://cesium.com https://*.cesium.com; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com https://fonts.googleapis.com; font-src 'self' https://fonts.cdnfonts.com https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self'${debugConnect} https://my.spline.design https://*.spline.design https://raw.githubusercontent.com https://vercel.live https://*.vercel.live https://api.cesium.com https://*.cesium.com https://ion.cesium.com https://dev.virtualearth.net https://*.virtualearth.net https://*.tiles.virtualearth.net http://dev.virtualearth.net http://*.virtualearth.net http://*.tiles.virtualearth.net https://services.arcgisonline.com https://*.arcgisonline.com http://services.arcgisonline.com http://*.arcgisonline.com https://tile.googleapis.com https://*.googleapis.com https://*.gstatic.com blob: data:; worker-src blob: 'self';`

    return [
      {
        // Long-lived immutable cache for encoded video assets
        source: '/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp
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
