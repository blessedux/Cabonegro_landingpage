'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { motion, AnimatePresence } from 'framer-motion'
import { routing } from '@/i18n/routing'

export default function UnifiedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // Always visible after mount
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { startFadeOut, isNavbarHidden, setIsNavbarHidden } = useAnimation()
  const { showPreloaderB, isPreloaderBVisible } = usePreloader()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  // Use next-intl's useLocale hook instead of pathname parsing
  const currentLocale = locale as string

  // Get localized content based on current locale
  const getLocalizedContent = () => {
    switch (currentLocale) {
      case 'es':
        return {
          explore: 'Explorar Terreno',
          deck: 'Ver Deck',
          faq: 'FAQ',
          contact: 'Contacto',
          language: 'Idioma:',
          contactButton: 'Contáctanos'
        }
      case 'zh':
        return {
          explore: '探索地形',
          deck: '查看甲板',
          faq: '常见问题',
          contact: '联系我们',
          language: '语言:',
          contactButton: '联系我们'
        }
      default:
        return {
          explore: 'Explore Terrain',
          deck: 'View Deck',
          faq: 'FAQ',
          contact: 'Contact Us',
          language: 'Language:',
          contactButton: 'Contact Us'
        }
    }
  }

  const content = getLocalizedContent()

  // Navbar always visible after mount and on pathname/locale changes - reliable
  useEffect(() => {
    setIsVisible(true)
    // Reset navbar hidden state on locale/pathname change to ensure it shows
    setIsNavbarHidden(false)
  }, [pathname, locale, setIsNavbarHidden]) // Reset visibility on pathname or locale change

  // Ensure navbar is visible after navigation completes and preloader hides
  useEffect(() => {
    // When preloader hides, ensure navbar is visible and slides down
    if (!isPreloaderBVisible) {
      setIsVisible(true)
      setIsNavbarHidden(false) // Force navbar to show
      
      // Small delay to ensure smooth slide-down animation
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsNavbarHidden(false)
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [isPreloaderBVisible, setIsNavbarHidden])

  // Ensure navbar is visible after navigation completes
  useEffect(() => {
    // Reset navbar state immediately on pathname/locale change
    setIsVisible(true)
    setIsNavbarHidden(false)
    
    // Also ensure it's visible after a short delay to handle any race conditions
    const timer = setTimeout(() => {
      setIsVisible(true)
      setIsNavbarHidden(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname, locale, setIsNavbarHidden])

  // Prefetch language route on hover for instant switching
  const prefetchLanguageRoute = (newLocale: string) => {
    if (newLocale === currentLocale || !routing.locales.includes(newLocale as any)) return
    
    // Get path without locale prefix
    let pathWithoutLocale = pathname
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}`)) {
        pathWithoutLocale = pathname.substring(loc.length + 1) || ''
        break
      }
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Build target path and prefetch
    const targetPath = `/${newLocale}${pathWithoutLocale || ''}`
    router.prefetch(targetPath)
  }

  // Handle language change with next/navigation router
  const handleLanguageChange = (newLocale: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 [UnifiedNavbar] Language change initiated:', {
        from: currentLocale,
        to: newLocale,
        currentPath: pathname
      })
    }

    if (newLocale === currentLocale || !routing.locales.includes(newLocale as any)) {
      return
    }
    
    // Get path without locale prefix
    let pathWithoutLocale = pathname
    for (const loc of routing.locales) {
      if (pathname.startsWith(`/${loc}`)) {
        pathWithoutLocale = pathname.substring(loc.length + 1) || ''
        break
      }
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Build target path
    const targetPath = `/${newLocale}${pathWithoutLocale || ''}`
    
    // Show preloader IMMEDIATELY - no delay, synchronous state update
    showPreloaderB()
    
    // Navigate immediately - preloader will overlay everything
    // Use microtask to ensure preloader state is set before navigation
    Promise.resolve().then(() => {
      router.push(targetPath)
    })
  }

  // Handle Explore Terrain click
  const handleExploreTerrain = () => {
    startFadeOut()
    
    // Navigate to explore route after animations using next-intl router
    setTimeout(() => {
      router.push('/explore')
    }, 1000)
  }

  // Log visibility state for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👁️ [UnifiedNavbar] Visibility state:', {
        isVisible,
        isNavbarHidden,
        pathname,
        locale
      })
    }
  }, [isVisible, isNavbarHidden, pathname, locale])

  return (
    <header className={`fixed left-0 right-0 z-50 p-4 transition-all duration-500 ease-out ${
      // Simple visibility logic - always show unless explicitly hidden
      // Force visible on pathname/locale change to ensure reliability
      isNavbarHidden 
        ? '-translate-y-full opacity-0' 
        : 'top-0 translate-y-0 opacity-100'
    }`}>
      <nav className="container mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link href={`/${currentLocale}`} className="cursor-pointer">
                <img 
                  src="/cabonegro_logo.png" 
                  alt="Cabo Negro" 
                  className="h-11 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={handleExploreTerrain}
                className="text-sm hover:text-gray-300 transition-colors uppercase"
              >
                {content.explore}
              </button>
              <Link href={`/${currentLocale}/deck`} className="text-sm hover:text-gray-300 transition-colors uppercase">
                {content.deck}
              </Link>
              <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">
                {content.faq}
              </a>
              
              {/* Language Toggle with prefetching */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLanguageChange(lang.code)
                    }}
                    onMouseEnter={() => prefetchLanguageRoute(lang.code)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      currentLocale === lang.code
                        ? 'text-white bg-white/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>

              <Link href={`/${currentLocale}/contact`}>
                <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
                  {content.contact}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation with Animation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-white/10">
                  <div className="flex flex-col gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleExploreTerrain()
                      }}
                      className="text-sm hover:text-gray-300 transition-colors uppercase py-2 text-left"
                    >
                      {content.explore}
                    </button>
                    <Link 
                      href={`/${currentLocale}/deck`} 
                      className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {content.deck}
                    </Link>
                    <a 
                      href="#FAQ" 
                      className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {content.faq}
                    </a>
                    
                    {/* Mobile Language Toggle with prefetching */}
                    <div className="flex items-center gap-2 py-2">
                      <span className="text-sm text-gray-400 uppercase">{content.language}</span>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={(e) => {
                            e.preventDefault()
                            handleLanguageChange(lang.code)
                            setMobileMenuOpen(false)
                          }}
                          onMouseEnter={() => prefetchLanguageRoute(lang.code)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            currentLocale === lang.code
                              ? 'text-white bg-white/20'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {lang.code.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <Link href={`/${currentLocale}/contact`} className="w-full mt-2">
                      <Button
                        variant="outline"
                        className="uppercase border-white text-white hover:bg-white hover:text-black w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {content.contactButton}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  )
}
