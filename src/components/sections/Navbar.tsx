'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useAnimation } from '@/contexts/AnimationContext'
import { usePreloader } from '@/contexts/PreloaderContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isOverWhiteBackground, setIsOverWhiteBackground] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const navbarRef = useRef<HTMLElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { startFadeOut, isNavbarHidden, setIsNavbarHidden } = useAnimation()
  const { isPreloaderVisible, isPreloaderComplete, showPreloaderB, setPreloaderVisible, setPreloaderComplete } = usePreloader()

  // Detect when navbar is over white background sections
  useEffect(() => {
    const checkBackground = () => {
      if (!navbarRef.current) return
      
      const navbarRect = navbarRef.current.getBoundingClientRect()
      const navbarCenterY = navbarRect.top + navbarRect.height / 2
      
      // Check if navbar center is over white background sections
      // But exclude sections that should keep navbar black
      const keepBlackSections = document.querySelectorAll('[data-keep-navbar-black="true"]')
      let isOverKeepBlack = false
      
      keepBlackSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
          isOverKeepBlack = true
        }
      })
      
      // If over a section that should keep navbar black, don't turn white
      if (isOverKeepBlack) {
        setIsOverWhiteBackground(false)
        return
      }
      
      const whiteSections = document.querySelectorAll('[data-white-background="true"]')
      let isOverWhite = false
      
      whiteSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
          isOverWhite = true
        }
      })
      
      setIsOverWhiteBackground(isOverWhite)
    }
    
    // Check on scroll and resize
    window.addEventListener('scroll', checkBackground)
    window.addEventListener('resize', checkBackground)
    checkBackground() // Initial check
    
    return () => {
      window.removeEventListener('scroll', checkBackground)
      window.removeEventListener('resize', checkBackground)
    }
  }, [])

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false)
      }
    }

    if (languageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [languageDropdownOpen])

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  // Determine current language from pathname
  const currentLocale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : pathname.startsWith('/en') ? 'en' : 'en'
  
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  // Get localized text based on current locale
  const getLocalizedText = () => {
    const texts = {
      en: {
        exploreTerrain: 'Explore Terrain',
        viewDeck: 'View Deck',
        faq: 'FAQ',
        contactUs: 'Contact Us',
        language: 'Language:'
      },
      es: {
        exploreTerrain: 'Explorar Terreno',
        viewDeck: 'Ver Deck',
        faq: 'Preguntas Frecuentes',
        contactUs: 'Contáctanos',
        language: 'Idioma:'
      },
      zh: {
        exploreTerrain: '探索地形',
        viewDeck: '查看甲板',
        faq: '常见问题',
        contactUs: '联系我们',
        language: '语言:'
      },
      fr: {
        exploreTerrain: 'Explorer le Terrain',
        viewDeck: 'Voir le Deck',
        faq: 'FAQ',
        contactUs: 'Nous Contacter',
        language: 'Langue:'
      }
    }
    return texts[currentLocale] || texts.en
  }

  const localizedText = getLocalizedText()

  // Dropdown animation only after preloader completes
  useEffect(() => {
    // Check if we're on deck, explore, or contact routes - show navbar immediately and reset hidden state
    if (pathname.includes('/deck') || pathname.includes('/explore') || pathname.includes('/contact')) {
      // Reset navbar hidden state when navigating to explore/deck/contact pages
      setIsNavbarHidden(false)
      setIsVisible(true) // Show immediately for these routes
      return
    }
    
    // Normal preloader logic for other routes
    // Show navbar when preloader completes OR if preloader is not visible (for faster initial load)
    if ((isPreloaderComplete && !isPreloaderVisible) || (!isPreloaderVisible && !showPreloaderB)) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 300) // Reduced delay for smoother entrance

      return () => clearTimeout(timer)
    }
  }, [isPreloaderComplete, isPreloaderVisible, pathname, setIsNavbarHidden, showPreloaderB])

  // Handle language change
  const handleLanguageChange = (newLocale: string) => {
    // Check if we're on a special page (explore, deck, contact)
    const isOnSpecialPage = pathname.includes('/explore') || 
                           pathname.includes('/deck') || 
                           pathname.includes('/contact')
    
    // Check if we're on homepage (or root)
    const isOnHomePage = pathname === '/en' || pathname === '/' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    
    // If switching language on special page, show PreloaderB
    if (isOnSpecialPage) {
      showPreloaderB()
    }
    
    // Remove current locale prefix from pathname
    let pathWithoutLocale = pathname
    if (pathname.startsWith('/es')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/es'
    } else if (pathname.startsWith('/zh')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/zh'
    } else if (pathname.startsWith('/fr')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/fr'
    } else if (pathname.startsWith('/en')) {
      pathWithoutLocale = pathname.substring(3) // Remove '/en'
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
    // English routes use /en prefix, Spanish routes use /es prefix, Chinese routes use /zh prefix
    let delay = isOnSpecialPage ? 100 : 0
    
    // If switching language on homepage, show main preloader and delay navigation slightly
    if (isOnHomePage && !isOnSpecialPage) {
      setPreloaderVisible(true)
      setPreloaderComplete(false)
      delay = 50 // Small delay to ensure preloader state is set before navigation
    }
    setTimeout(() => {
      if (newLocale === 'en') {
        const targetPath = '/en' + pathWithoutLocale
        router.push(targetPath)
      } else if (newLocale === 'es') {
        const targetPath = '/es' + pathWithoutLocale
        router.push(targetPath)
      } else if (newLocale === 'zh') {
        const targetPath = '/zh' + pathWithoutLocale
        router.push(targetPath)
      } else if (newLocale === 'fr') {
        const targetPath = '/fr' + pathWithoutLocale
        router.push(targetPath)
      }
    }, delay)
  }

  // Handle Explore Terrain click
  const handleExploreTerrain = () => {
    // If already on explore, do nothing and ensure navbar remains visible
    if (pathname.includes('/explore')) {
      setIsNavbarHidden(false)
      return
    }
    startFadeOut()
    showPreloaderB()
    // Navigate to explore route - let usePageTransition handle PreloaderB on route change
    setTimeout(() => {
      const explorePath = currentLocale === 'en' ? '/en/explore' : 
                         currentLocale === 'es' ? '/es/explore' :
                         currentLocale === 'zh' ? '/zh/explore' :
                         currentLocale === 'fr' ? '/fr/explore' : '/en/explore'
      router.push(explorePath)
    }, 100)
  }

  // Handle Home navigation (logo click)
  const handleHomeClick = (e: React.MouseEvent) => {
    // If on explore page, show PreloaderB before navigating home
    if (pathname.includes('/explore')) {
      e.preventDefault()
      showPreloaderB()
      setTimeout(() => {
        const homePath = currentLocale === 'en' ? '/en' : 
                        currentLocale === 'es' ? '/es' :
                        currentLocale === 'zh' ? '/zh' :
                        currentLocale === 'fr' ? '/fr' : '/en'
        router.push(homePath)
      }, 100)
    }
  }

  // Handle FAQ click
  const handleFAQClick = (e: React.MouseEvent) => {
    const isOnSpecialPage = pathname.includes('/explore') || 
                           pathname.includes('/deck') || 
                           pathname.includes('/contact')
    
    // If on homepage, just scroll to FAQ
    const isOnHomePage = pathname === '/en' || pathname === '/' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    if (!isOnSpecialPage && isOnHomePage) {
      e.preventDefault()
      const faqElement = document.getElementById('FAQ')
      if (faqElement) {
        faqElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      setMobileMenuOpen(false)
      return
    }
    
    // If on special page, navigate to homepage with FAQ hash
    e.preventDefault()
    showPreloaderB()
    setMobileMenuOpen(false)
    
    setTimeout(() => {
      const homePath = currentLocale === 'en' ? '/en#FAQ' : 
                      currentLocale === 'es' ? '/es#FAQ' :
                      currentLocale === 'zh' ? '/zh#FAQ' :
                      currentLocale === 'fr' ? '/fr#FAQ' : '/en#FAQ'
      router.push(homePath)
    }, 100)
  }

  const textColor = isOverWhiteBackground ? 'text-black' : 'text-white'
  const hoverColor = isOverWhiteBackground ? 'hover:text-gray-700' : 'hover:text-gray-300'
  const borderColor = isOverWhiteBackground ? 'border-black/20' : 'border-white/20'
  const bgColor = isOverWhiteBackground ? 'bg-white/80' : 'bg-white/5'

  return (
    <header 
      ref={navbarRef}
      className={`fixed left-0 right-0 z-50 p-4 transition-all duration-500 ease-out ${
      // For deck, explore, and contact routes, only hide if navbar is explicitly hidden
      pathname.includes('/deck') || pathname.includes('/explore') || pathname.includes('/contact')
        ? (isNavbarHidden ? '-translate-y-full opacity-0' : 'top-0 translate-y-0 opacity-100')
        : (isNavbarHidden || isPreloaderVisible
            ? '-translate-y-full opacity-0' 
            : isVisible 
              ? 'top-0 translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0')
    }`}>
      <nav className="container mx-auto">
        <div className={`${bgColor} backdrop-blur-xl border ${borderColor} rounded-2xl shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link 
                href={currentLocale === 'en' ? '/en' : 
                      currentLocale === 'es' ? '/es' :
                      currentLocale === 'zh' ? '/zh' :
                      currentLocale === 'fr' ? '/fr' : '/en'} 
                className="cursor-pointer"
                onClick={handleHomeClick}
              >
                <img 
                  src="/cabonegro_logo.png" 
                  alt="Cabo Negro" 
                  className="h-12 w-auto hover:opacity-80 transition-all duration-300"
                  style={{
                    filter: isOverWhiteBackground ? 'brightness(0)' : 'brightness(1)',
                    transition: 'filter 0.3s ease-in-out'
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={handleExploreTerrain}
                className={`text-sm ${hoverColor} transition-colors uppercase ${textColor}`}
              >
                {localizedText.exploreTerrain}
              </button>
              <button 
                onClick={() => {
                  showPreloaderB()
                  const deckPath = currentLocale === 'en' ? '/en/deck' : 
                                  currentLocale === 'es' ? '/es/deck' :
                                  currentLocale === 'zh' ? '/zh/deck' :
                                  currentLocale === 'fr' ? '/fr/deck' : '/en/deck'
                  setTimeout(() => router.push(deckPath), 100)
                }}
                className={`text-sm ${hoverColor} transition-colors uppercase ${textColor}`}
              >
                {localizedText.viewDeck}
              </button>
              <button 
                onClick={handleFAQClick}
                className={`text-sm ${hoverColor} transition-colors uppercase ${textColor}`}
              >
                {localizedText.faq}
              </button>
              
              {/* Language Dropdown */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded transition-colors ${
                    isOverWhiteBackground 
                      ? 'text-black bg-white/80 border border-black/20 hover:bg-white' 
                      : 'text-white bg-white/5 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span>{currentLanguage.code.toUpperCase()}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {languageDropdownOpen && (
                  <div className={`absolute top-full right-0 mt-2 min-w-[120px] rounded-lg shadow-lg z-50 ${
                    isOverWhiteBackground 
                      ? 'bg-white border border-black/20' 
                      : 'bg-black/90 border border-white/20'
                  }`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          handleLanguageChange(lang.code)
                          setLanguageDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          currentLocale === lang.code
                            ? isOverWhiteBackground 
                              ? 'bg-accent text-black' 
                              : 'bg-accent text-white'
                            : isOverWhiteBackground
                              ? 'text-black hover:bg-gray-100'
                              : 'text-white hover:bg-white/10'
                        } ${lang.code === languages[0]?.code ? 'rounded-t-lg' : ''} ${lang.code === languages[languages.length - 1]?.code ? 'rounded-b-lg' : ''}`}
                      >
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className={`uppercase transition-all duration-300 ${
                  isOverWhiteBackground 
                    ? 'border-black text-black bg-transparent hover:bg-black hover:text-white' 
                    : 'border-white text-white bg-transparent hover:bg-white hover:text-black'
                }`}
                onClick={() => {
                  showPreloaderB()
                  const contactPath = currentLocale === 'en' ? '/en/contact' : 
                                     currentLocale === 'es' ? '/es/contact' :
                                     currentLocale === 'zh' ? '/zh/contact' :
                                     currentLocale === 'fr' ? '/fr/contact' : '/en/contact'
                  setTimeout(() => router.push(contactPath), 100)
                }}
              >
                {localizedText.contactUs}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${textColor} ${isOverWhiteBackground ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
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
            <div className="px-6 pb-6 border-t border-white/20">
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleExploreTerrain()
                  }}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.exploreTerrain}
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    showPreloaderB()
                    const deckPath = currentLocale === 'en' ? '/en/deck' : 
                                    currentLocale === 'es' ? '/es/deck' :
                                    currentLocale === 'zh' ? '/zh/deck' :
                                    currentLocale === 'fr' ? '/fr/deck' : '/en/deck'
                    setTimeout(() => router.push(deckPath), 100)
                  }}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.viewDeck}
                </button>
                <button 
                  onClick={handleFAQClick}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.faq}
                </button>
                
                {/* Mobile Language Toggle */}
                <div className="flex items-center gap-2 py-2">
                  <span className={`text-sm uppercase ${isOverWhiteBackground ? 'text-black/80' : 'text-white/80'}`}>{localizedText.language}</span>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        currentLocale === lang.code
                          ? `${isOverWhiteBackground ? 'text-black bg-accent border border-accent' : 'text-white bg-accent border border-accent'}`
                          : `${textColor} ${hoverColor}`
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    showPreloaderB()
                    const contactPath = currentLocale === 'en' ? '/en/contact' : 
                                       currentLocale === 'es' ? '/es/contact' :
                                       currentLocale === 'zh' ? '/zh/contact' :
                                       currentLocale === 'fr' ? '/fr/contact' : '/en/contact'
                    setTimeout(() => router.push(contactPath), 100)
                  }}
                  variant="outline"
                  className={`uppercase transition-all duration-300 w-full mt-2 ${
                    isOverWhiteBackground 
                      ? 'border-black text-black bg-transparent hover:bg-black hover:text-white' 
                      : 'border-white text-white bg-transparent hover:bg-white hover:text-black'
                  }`}
                >
                  {localizedText.contactUs}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}