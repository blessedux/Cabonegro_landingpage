import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  // If locale is undefined, it means middleware didn't detect it - this shouldn't happen
  // but we'll handle it gracefully by using defaultLocale
  // During static generation, locale might be undefined - this is expected, so only warn in development
  if (!locale) {
    // Only warn in development mode - during build/static generation this is expected
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.warn('⚠️  No locale detected in getRequestConfig, using defaultLocale');
    }
    locale = routing.defaultLocale;
  }
  
  if (!routing.locales.includes(locale as any)) {
    // Only warn in development mode for invalid locales
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.warn(`⚠️  Invalid locale: ${locale}, using defaultLocale`);
    }
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
