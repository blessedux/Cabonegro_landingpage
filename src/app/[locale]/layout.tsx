import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageTransitionWrapper } from '@/components/ui/PageTransitionWrapper';
import { WebVitals } from '@/components/analytics/WebVitals';
import { LocaleHtmlLang } from '@/components/ui/LocaleHtmlLang';
import { routing } from '@/i18n/routing';

// Generate static params for all locales to enable static generation
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
  if (!routing.locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlLang />
      <WebVitals debug={process.env.NODE_ENV === 'development'} />
      <PageTransitionWrapper>
        {children}
      </PageTransitionWrapper>
    </NextIntlClientProvider>
  );
}
