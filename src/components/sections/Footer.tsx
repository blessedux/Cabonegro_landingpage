'use client'

import { SimpleFooter } from '@/components/sections/SimpleFooter'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  
  // Detect locale from pathname
  let locale: 'en' | 'es' | 'zh' | 'fr' = 'en'
  if (pathname.startsWith('/es')) {
    locale = 'es'
  } else if (pathname.startsWith('/zh')) {
    locale = 'zh'
  } else if (pathname.startsWith('/fr')) {
    locale = 'fr'
  }
  
  return <SimpleFooter locale={locale} />
}