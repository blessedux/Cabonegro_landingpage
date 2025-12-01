import { getTranslations } from 'next-intl/server';
import LocaleHomePage from '@/components/pages/LocaleHomePage';

export default async function LocaleHome({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Pre-fetch translations for SSR
  await getTranslations({ locale });
  
  return <LocaleHomePage locale={locale} />
}
