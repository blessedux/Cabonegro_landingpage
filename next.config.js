const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
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
            value: "frame-src 'self' https://my.spline.design https://*.spline.design https://gamma.app https://*.gamma.app; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://my.spline.design https://*.spline.design; style-src 'self' 'unsafe-inline' https://my.spline.design https://*.spline.design https://fonts.cdnfonts.com; font-src 'self' https://fonts.cdnfonts.com; img-src 'self' data: https:; connect-src 'self' https://my.spline.design https://*.spline.design;"
          }
        ]
      }
    ]
  }
};

module.exports = withNextIntl(nextConfig);
