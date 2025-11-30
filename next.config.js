const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  // Optimize compilation for faster language switching
  swcMinify: true,
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
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
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://my.spline.design https://*.spline.design; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com https://fonts.googleapis.com; font-src 'self' https://fonts.cdnfonts.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://my.spline.design https://*.spline.design https://raw.githubusercontent.com;"
          }
        ]
      }
    ]
  }
};

module.exports = withNextIntl(nextConfig);
