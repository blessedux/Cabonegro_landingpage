// Shared routing configuration for next-intl
export const routing = {
  // A list of all locales that are supported
  locales: ['en', 'es', 'zh', 'fr'] as const,

  // Used when no locale matches
  defaultLocale: 'en' as const,
  
  // Always show locale prefix - this ensures all routes have locale prefix
  localePrefix: 'always' as const
};

// Type for locales
export type Locale = (typeof routing.locales)[number];

