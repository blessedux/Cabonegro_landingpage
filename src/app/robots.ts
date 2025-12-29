import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  'https://www.cabonegro.cl');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/test/',
          '/test-tiles/',
          '/preloader-test/',
          '/layout-preloader-test/',
          '/procedural-terrain-test/',
          '/gallery-backup/',
          '/footer2/',
          '/basic/',
          '/scene-3d/',
          '/investors-deck/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/test/',
          '/test-tiles/',
          '/preloader-test/',
          '/layout-preloader-test/',
          '/procedural-terrain-test/',
          '/gallery-backup/',
          '/footer2/',
          '/basic/',
          '/scene-3d/',
          '/investors-deck/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

