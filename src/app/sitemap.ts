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
  // Always use production domain for sitemap (sitemaps should only reference production URLs)
  // NEXT_PUBLIC_SITE_URL should be set to the production domain in production environment
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cabonegro.cl';

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

