'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function NavbarEs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { startFadeOut, isNavbarHidden } = useAnimation()
  const { isPreloaderVisible, isPreloaderComplete } = usePreloader()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' }
  ]

  // Determine current language from pathname
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'

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

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    if (pathname.startsWith('/es')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/es'
    }
    
    // Ensure path starts with '/'
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale
    }
    
    // Handle empty path (root)
    if (pathWithoutLocale === '/') {
      pathWithoutLocale = ''
    }
    
    // Navigate to the new locale with the same path
    // English routes don't have a prefix, Spanish routes use /es prefix
    if (newLocale === 'en') {
      router.push(pathWithoutLocale || '/')
    } else {
      router.push('/es' + pathWithoutLocale)
    }
  }

  // Handle Explore Terrain click
  const handleExploreTerrain = () => {
    startFadeOut()
    
    // Navigate to explore route after animations
    setTimeout(() => {
      router.push('/es/explore')
    }, 1000)
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
              <Link href="/es" className="cursor-pointer">
                <img 
                  src="/cabonegro_logo.png" 
                  alt="Cabo Negro" 
                  className="h-12 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={handleExploreTerrain}
                className="text-sm hover:text-gray-300 transition-colors uppercase"
              >
                Explorar Terreno
              </button>
              <Link href="/es/deck" className="text-sm hover:text-gray-300 transition-colors uppercase">Ver Deck</Link>
              <a href="#FAQ" className="text-sm hover:text-gray-300 transition-colors uppercase">FAQ</a>
              
              {/* Language Toggle */}
              <div className="flex items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
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

              <Link href="/es/contact">
                <Button variant="outline" className="uppercase border-white text-white hover:bg-white hover:text-black">
                  Contacto
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
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 pb-6 border-t border-white/10">
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleExploreTerrain()
                  }}
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2 text-left"
                >
                  Explorar Terreno
                </button>
                <Link 
                  href="/es/deck" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ver Deck
                </Link>
                <a 
                  href="#FAQ" 
                  className="text-sm hover:text-gray-300 transition-colors uppercase py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                
                {/* Mobile Language Toggle */}
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm text-gray-400 uppercase">Idioma:</span>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
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

                <Link href="/es/contact" className="w-full mt-2">
                  <Button
                    variant="outline"
                    className="uppercase border-white text-white hover:bg-white hover:text-black w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contáctanos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
