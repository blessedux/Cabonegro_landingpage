'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MagneticText } from '@/components/ui/morphing-cursor'
import { Button } from '@/components/ui/button'
import { routing } from '@/i18n/routing'
import HeroWave from '@/components/ui/dynamic-wave-canvas-background'

// Translations for 404 page
const translations: Record<string, { title: string[]; hoverText: string[]; homeButton: string }> = {
  en: {
    title: ['Oops,', 'Page not found'],
    hoverText: ['go back to', 'Cabo Negro'],
    homeButton: 'Home'
  },
  es: {
    title: ['Oops,', 'Página no encontrada'],
    hoverText: ['volver a', 'Cabo Negro'],
    homeButton: 'Inicio'
  },
  fr: {
    title: ['Oops,', 'Page non trouvée'],
    hoverText: ['retour à', 'Cabo Negro'],
    homeButton: 'Accueil'
  },
  zh: {
    title: ['糟糕，', '页面未找到'],
    hoverText: ['返回', '卡波内格罗'],
    homeButton: '首页'
  }
}

export default function NotFound() {
  const pathname = usePathname()
  const [locale, setLocale] = useState<string>(routing.defaultLocale)

  useEffect(() => {
    // Detect locale from pathname or window location
    let detectedLocale: string | undefined
    
    if (pathname) {
      detectedLocale = routing.locales.find(loc => pathname.startsWith(`/${loc}`))
    }
    
    // Fallback to window location if pathname doesn't have locale
    if (!detectedLocale && typeof window !== 'undefined') {
      const path = window.location.pathname
      detectedLocale = routing.locales.find(loc => path.startsWith(`/${loc}`))
    }
    
    if (detectedLocale) {
      setLocale(detectedLocale)
    }
  }, [pathname])

  const t = translations[locale] || translations[routing.defaultLocale]

  useEffect(() => {
    // Override body background for 404 page
    document.body.style.backgroundColor = 'transparent'
    return () => {
      // Reset on unmount
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-16 p-8 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      <HeroWave />
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl relative z-10">
        <div className="text-center w-full flex justify-center">
          <MagneticText text={t.title} hoverText={t.hoverText} />
        </div>
        <Link href={`/${locale}`}>
          <Button size="lg" variant="outline" className="mt-8 bg-transparent border-white text-white hover:bg-white/10">
            {t.homeButton}
          </Button>
        </Link>
      </div>
    </main>
  )
}

