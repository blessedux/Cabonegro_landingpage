import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Always use production domain for robots.txt
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cabonegro.cl';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/test/',
          '/preloader-test/',
          '/preloader-globe-test/',
          '/layout-preloader-test/',
          '/gallery-backup/',
          '/footer2/',
          '/basic/',
          '/investors-deck/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/test/',
          '/preloader-test/',
          '/preloader-globe-test/',
          '/layout-preloader-test/',
          '/gallery-backup/',
          '/footer2/',
          '/basic/',
          '/investors-deck/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

