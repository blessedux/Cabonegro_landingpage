import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PreloaderProvider } from '@/contexts/PreloaderContext';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { CookieBannerProvider } from '@/contexts/CookieBannerContext';
import { ThemeProvider } from 'next-themes';
import { PageTransitionWrapper } from '@/components/ui/PageTransitionWrapper';

const locales = ['en', 'es', 'zh', 'fr'];

// Generate static params for all locales to enable static generation
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as string)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <PreloaderProvider>
              <AnimationProvider>
                <CookieBannerProvider>
                  <PageTransitionWrapper>
                    {children}
                  </PageTransitionWrapper>
                </CookieBannerProvider>
              </AnimationProvider>
            </PreloaderProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
