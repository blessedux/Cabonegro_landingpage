import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cabonegro.cl';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
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
          '/footer2/',
          '/basic/',
          '/investors-deck/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
