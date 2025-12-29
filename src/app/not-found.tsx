'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MagneticText } from '@/components/ui/morphing-cursor'
import { Button } from '@/components/ui/button'
import { routing } from '@/i18n/routing'
import HeroWave from '@/components/ui/dynamic-wave-canvas-background'

// Translations for 404 page
const translations: Record<string, { title: string[]; hoverText: string[]; errorText: string; homeButton: string }> = {
  en: {
    title: ['Oops, page', 'not found'],
    hoverText: ['Go back to', 'Cabo Negro'],
    errorText: '404 error',
    homeButton: 'Home'
  },
  es: {
    title: ['Oops,', 'Página no encontrada'],
    hoverText: ['Volver a', 'Cabo Negro'],
    errorText: 'error 404',
    homeButton: 'Inicio'
  },
  fr: {
    title: ['Oops,', 'Page non trouvée'],
    hoverText: ['Retour à', 'Cabo Negro'],
    errorText: 'erreur 404',
    homeButton: 'Accueil'
  },
  zh: {
    title: ['糟糕，', '页面未找到'],
    hoverText: ['返回', '卡波内格罗'],
    errorText: '404 错误',
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
    
    // Override body background for 404 page (combined effect for better performance)
    const originalBg = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'transparent'
    
    return () => {
      // Reset on unmount
      document.body.style.backgroundColor = originalBg
    }
  }, [pathname])

  const t = translations[locale] || translations[routing.defaultLocale]

  // Ensure favicon is set for 404 page
  useEffect(() => {
    const updateFavicon = () => {
      // Remove any existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]')
      existingLinks.forEach(link => link.remove())
      
      // Add favicon links
      const faviconIco = document.createElement('link')
      faviconIco.rel = 'icon'
      faviconIco.href = '/favicon.ico'
      faviconIco.type = 'image/x-icon'
      document.head.appendChild(faviconIco)
      
      const favicon16 = document.createElement('link')
      favicon16.rel = 'icon'
      favicon16.href = '/favicon-16x16.png'
      favicon16.type = 'image/png'
      favicon16.sizes = '16x16'
      document.head.appendChild(favicon16)
      
      const favicon32 = document.createElement('link')
      favicon32.rel = 'icon'
      favicon32.href = '/favicon-32x32.png'
      favicon32.type = 'image/png'
      favicon32.sizes = '32x32'
      document.head.appendChild(favicon32)
      
      const appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      appleIcon.href = '/apple-touch-icon.png'
      document.head.appendChild(appleIcon)
    }
    
    updateFavicon()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-16 p-8 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      <HeroWave />
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl relative z-10">
        <div className="text-center w-full flex justify-center">
          <MagneticText text={t.title} hoverText={t.hoverText} />
        </div>
        <p className="text-white/60 text-xs font-light tracking-wider uppercase -mt-2 mb-0">
          {t.errorText}
        </p>
        <Link href={`/${locale}`}>
          <Button size="lg" variant="outline" className="mt-0 bg-transparent border-white text-white hover:bg-white/10">
            {t.homeButton}
          </Button>
        </Link>
      </div>
    </main>
  )
}

