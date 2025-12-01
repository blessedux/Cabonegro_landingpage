import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  // If locale is undefined, it means middleware didn't detect it - this shouldn't happen
  // but we'll handle it gracefully by using defaultLocale
  if (!locale) {
    console.warn('⚠️  No locale detected in getRequestConfig, using defaultLocale');
    locale = routing.defaultLocale;
  }
  
  if (!routing.locales.includes(locale as any)) {
    console.warn(`⚠️  Invalid locale: ${locale}, using defaultLocale`);
    locale = routing.defaultLocale;
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
