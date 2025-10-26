import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/ui/language-switcher';

const locales = ['en', 'es'];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* Development Navigation - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-4 right-4 z-50 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700 space-y-1">
              <a 
                href="/preloader-test" 
                className="block text-white text-sm hover:text-blue-400 transition-colors"
              >
                🧪 Terminal Preloader
              </a>
              <a 
                href="/layout-preloader-test" 
                className="block text-white text-sm hover:text-blue-400 transition-colors"
              >
                🎨 Layout Preloader
              </a>
            </div>
          )}
          
          {/* Language Switcher */}
          <div className="fixed top-4 left-4 z-50">
            <LanguageSwitcher />
          </div>
          
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
