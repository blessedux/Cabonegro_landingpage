import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

// Routes to include in sitemap (excluding test/backup routes)
const publicRoutes = [
  '', // Home page
  'contact',
  'deck',
  'gallery',
  'parque-logistico',
  'parque-tecnologico',
  'partners',
  'terminal-maritimo',
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Get base URL from environment variable or use default
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  'https://www.cabonegro.cl');

  const currentDate = new Date();
  
  // Generate sitemap entries for all locales and routes
  const entries: MetadataRoute.Sitemap = [];

  // Home page (highest priority)
  routing.locales.forEach((locale) => {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`])
        ),
      },
    });
  });

  // Other public routes
  publicRoutes.slice(1).forEach((route) => {
    routing.locales.forEach((locale) => {
      entries.push({
        url: `${baseUrl}/${locale}/${route}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: route === 'contact' ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/${route}`])
          ),
        },
      });
    });
  });

  return entries;
}

