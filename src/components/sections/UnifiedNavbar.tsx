'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function UnifiedNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { startFadeOut, isNavbarHidden } = useAnimation()
  const { isPreloaderVisible, isPreloaderComplete, setPreloaderComplete, setPreloaderVisible } = usePreloader()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ]

  // Determine current language from pathname
  const currentLocale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : 'en'

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

  // Dropdown animation only after preloader completes
  useEffect(() => {
    // Check if we're on the deck route - show navbar immediately
    if (pathname.includes('/deck')) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100) // Quick delay for deck route
      return () => clearTimeout(timer)
    }
    
    // Normal preloader logic for other routes
    if (isPreloaderComplete && !isPreloaderVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500) // Delay for smooth entrance after preloader

      return () => clearTimeout(timer)
    }
  }, [isPreloaderComplete, isPreloaderVisible, pathname])

  // Handle language change with smooth transition
  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return
    
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    if (pathname.startsWith('/es')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/es'
    } else if (pathname.startsWith('/zh')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/zh'
    }
    
    // Ensure path starts with '/'
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Construct target path
    let targetPath = ''
    if (newLocale === 'en') {
      targetPath = pathWithoutLocale || '/'
    } else if (newLocale === 'es') {
      targetPath = '/es' + pathWithoutLocale
    } else if (newLocale === 'zh') {
      targetPath = '/zh' + pathWithoutLocale
    }

    // Navigate immediately without complex transitions
    router.push(targetPath)
  }

  // Handle Explore Terrain click
  const handleExploreTerrain = () => {
    startFadeOut()
    
    // Navigate to explore route after animations
    setTimeout(() => {
      if (currentLocale === 'es') {
        router.push('/es/explore')
      } else if (currentLocale === 'zh') {
        router.push('/zh/explore')
      } else {
        router.push('/explore')
      }
    }, 1000)
  }

  // Get home link based on current locale
  const getHomeLink = () => {
    switch (currentLocale) {
      case 'es': return '/es'
      case 'zh': return '/zh'
      default: return '/'
    }
  }

  // Get deck link based on current locale
  const getDeckLink = () => {
    switch (currentLocale) {
      case 'es': return '/es/deck'
      case 'zh': return '/zh/deck'
      default: return '/deck'
    }
  }

  // Get contact link based on current locale
  const getContactLink = () => {
    switch (currentLocale) {
      case 'es': return '/es/contact'
      case 'zh': return '/zh/contact'
      default: return '/contact'
    }
  }

  return (
    <header className={`fixed left-0 right-0 z-50 p-4 transition-all duration-500 ease-out ${
      // For deck route, only hide if navbar is explicitly hidden
      pathname.includes('/deck') 
        ? (isNavbarHidden ? '-translate-y-full opacity-0' : 'top-0 translate-y-0 opacity-100')
        : (isNavbarHidden || isPreloaderVisible
            ? '-translate-y-full opacity-0' 
            : isVisible 
              ? 'top-0 translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0')
    }`}>
      <nav className="container mx-auto">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link href={getHomeLink()} className="cursor-pointer">
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
              <Link href={getDeckLink()} className="text-sm hover:text-gray-300 transition-colors uppercase">
                {content.deck}
              </Link>
              <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">
                {content.faq}
              </a>
              
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLanguageChange(lang.code)
                    }}
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

              <Link href={getContactLink()}>
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
                      href={getDeckLink()} 
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
                    
                    {/* Mobile Language Toggle */}
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

                    <Link href={getContactLink()} className="w-full mt-2">
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
