import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'zh', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match internationalized pathnames and redirect non-prefixed paths to default locale
    matcher: ['/', '/(es|en|zh|fr)/:path*', '/explore', '/deck', '/contact', '/partners', '/gallery']
};
