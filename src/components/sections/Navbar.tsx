'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
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
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { isNavbarHidden, setIsNavbarHidden } = useAnimation()
  const { isPreloaderVisible, isPreloaderComplete, isPreloaderBVisible, showPreloaderB, setPreloaderVisible, setPreloaderComplete, setLanguageSwitch } = usePreloader()

  // Detect when navbar is over white background sections
  useEffect(() => {
    const checkBackground = () => {
      if (!navbarRef.current) return
      
      const scrollY = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const navbarRect = navbarRef.current.getBoundingClientRect()
      const navbarTop = navbarRect.top
      const navbarBottom = navbarRect.bottom
      const navbarCenterY = navbarRect.top + navbarRect.height / 2
      
      // SPECIAL HANDLING FOR TERMINAL-MARITIMO PAGE
      // Check if we're on the terminal-maritimo page
      if (pathname.includes('/terminal-maritimo')) {
        const heroSection = document.querySelector('[data-hero-section="true"]')
        if (heroSection) {
          const heroRect = heroSection.getBoundingClientRect()
          // If navbar is over or within the hero section, use white text (dark background)
          if (navbarBottom <= heroRect.bottom) {
            setIsOverWhiteBackground(false)
            return
          }
          // If navbar is below hero section, check if over white background sections
          const whiteSections = document.querySelectorAll('[data-white-background="true"]')
          let isOverWhite = false
          whiteSections.forEach((section) => {
            const rect = section.getBoundingClientRect()
            if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
              isOverWhite = true
            }
          })
          setIsOverWhiteBackground(isOverWhite)
          return
        }
      }
      
      // FIRST: Check if we've scrolled to or past the Partners section
      // Once at or past Partners, keep navbar black for the rest of the page
      const partnersSection = document.querySelector('[data-partners-section="true"]')
      if (partnersSection) {
        const partnersRect = partnersSection.getBoundingClientRect()
        // If Partners section top is at or above navbar bottom (navbar has reached or passed Partners), keep navbar black
        // This ensures navbar text turns black when it reaches Partners section and stays black for all subsequent sections
        if (partnersRect.top <= navbarBottom) {
          setIsOverWhiteBackground(true)
          return
        }
      }
      
      // SECOND: Check if we're near the bottom of the page (where footer usually is)
      // If we're in the last 30% of the page, likely over footer - keep navbar black
      const scrollPercentage = (scrollY + windowHeight) / documentHeight
      if (scrollPercentage > 0.7) {
        setIsOverWhiteBackground(true)
        return
      }
      
      // THIRD: Check if navbar is over sections that should keep navbar black
      // This takes priority over white background sections
      const keepBlackSections = document.querySelectorAll('[data-keep-navbar-black="true"]')
      let isOverKeepBlack = false
      
      keepBlackSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        
        // More reliable overlap detection: check if navbar is anywhere near the section
        // This ensures Press and Footer sections always keep navbar black
        const isOverlapping = (
          // Navbar top is within section bounds (with generous padding)
          (navbarTop >= rect.top - 150 && navbarTop <= rect.bottom + 150) ||
          // Navbar bottom is within section bounds (with generous padding)
          (navbarBottom >= rect.top - 150 && navbarBottom <= rect.bottom + 150) ||
          // Navbar completely covers section
          (navbarTop <= rect.top && navbarBottom >= rect.bottom) ||
          // Navbar center is over section (with generous padding)
          (navbarCenterY >= rect.top - 150 && navbarCenterY <= rect.bottom + 150) ||
          // Section is visible in viewport and navbar is near it
          (rect.top <= windowHeight && rect.bottom >= 0 && 
           Math.abs(navbarCenterY - (rect.top + rect.bottom) / 2) < 300) ||
          // Navbar is above section but close (within 200px)
          (navbarBottom >= rect.top - 200 && navbarBottom <= rect.top) ||
          // Navbar is below section but close (within 200px)
          (navbarTop <= rect.bottom + 200 && navbarTop >= rect.bottom)
        )
        
        if (isOverlapping) {
          isOverKeepBlack = true
        }
      })
      
      // If over a section that should keep navbar black, ALWAYS keep it black and return early
      if (isOverKeepBlack) {
        setIsOverWhiteBackground(true)
        return
      }
      
      // FOURTH: Only check white background sections if we're NOT over a keep-black section
      // AND we haven't passed the Partners section yet
      const whiteSections = document.querySelectorAll('[data-white-background="true"]')
      let isOverWhite = false
      
      whiteSections.forEach((section) => {
        // Skip if this section also has keep-navbar-black attribute
        if (section.hasAttribute('data-keep-navbar-black')) {
          return
        }
        const rect = section.getBoundingClientRect()
        // Check if navbar overlaps with section
        if (navbarCenterY >= rect.top && navbarCenterY <= rect.bottom) {
          isOverWhite = true
        }
      })
      
      setIsOverWhiteBackground(isOverWhite)
    }
    
    // Check on scroll and resize with requestAnimationFrame for better performance
    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        checkBackground()
        rafId = null
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkBackground)
    checkBackground() // Initial check
    
    // Check more frequently to catch any missed updates, especially near footer
    const intervalId = setInterval(checkBackground, 25)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkBackground)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      clearInterval(intervalId)
    }
  }, [pathname])

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Also listen for touch events on mobile
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [mobileMenuOpen])

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇨🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  // Determine current language from pathname (extracted early for dependency tracking)
  const currentLocale = pathname.startsWith('/es') ? 'es' : pathname.startsWith('/zh') ? 'zh' : pathname.startsWith('/fr') ? 'fr' : pathname.startsWith('/en') ? 'en' : 'en'
  
  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  // Handle project navigation
  const handleProjectNavigation = (route: string) => {
    // No PreloaderB needed - project pages are fast, usePageTransition handles it
    // Navigate immediately without delay
    router.push(`/${currentLocale}${route}`)
  }

  // Get localized text based on current locale
  const getLocalizedText = () => {
    const texts = {
      en: {
        maritimeTerminal: 'Maritime Terminal',
        technologyPark: 'Technology Park',
        logisticsPark: 'Logistics Park',
        faq: 'FAQ',
        contactUs: 'Contact Us',
        language: 'Language:'
      },
      es: {
        maritimeTerminal: 'Terminal Marítimo',
        technologyPark: 'Parque Tecnológico',
        logisticsPark: 'Parque Logístico',
        faq: 'FAQ',
        contactUs: 'Contáctanos',
        language: 'Idioma:'
      },
      zh: {
        maritimeTerminal: '海运码头',
        technologyPark: '科技园',
        logisticsPark: '物流园',
        faq: '常见问题',
        contactUs: '联系我们',
        language: '语言:'
      },
      fr: {
        maritimeTerminal: 'Terminal Maritime',
        technologyPark: 'Parc Technologique',
        logisticsPark: 'Parc Logistique',
        faq: 'FAQ',
        contactUs: 'Nous Contacter',
        language: 'Langue:'
      }
    }
    return texts[currentLocale] || texts.en
  }

  const localizedText = getLocalizedText()

  // ALWAYS ensure navbar is visible on pathname change - critical for navigation
  useEffect(() => {
    // Immediately show navbar when pathname changes (navigation occurred)
    setIsNavbarHidden(false)
    setIsVisible(true)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Navbar: Pathname changed, forcing navbar to show', { pathname })
    }
  }, [pathname])

  // Dropdown animation only after preloader completes
  useEffect(() => {
    // Check if we're on deck, explore, contact, or terminal-maritimo routes - show navbar immediately and reset hidden state
    if (pathname.includes('/deck') || pathname.includes('/explore') || pathname.includes('/contact') || pathname.includes('/terminal-maritimo')) {
      // Reset navbar hidden state when navigating to these pages
      setIsNavbarHidden(false)
      // Show immediately for instant language switching
      setIsVisible(true)
      return
    }
    
    // Check both old preloader system (isPreloaderComplete) and new preloader system (isPreloaderBVisible)
    // On first load, isPreloaderBVisible is used, so we need to check when it becomes false
    const preloaderComplete = (isPreloaderComplete && !isPreloaderVisible) || !isPreloaderBVisible
    
    if (preloaderComplete) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsNavbarHidden(false) // Ensure navbar is not hidden
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Navbar: Preloader complete, showing navbar')
        }
      }, 300) // Reduced delay for faster navbar appearance after preloader

      return () => clearTimeout(timer)
    }
  }, [isPreloaderComplete, isPreloaderVisible, isPreloaderBVisible, pathname, currentLocale, setIsNavbarHidden])

  // Periodic check to ensure navbar is always visible and clickable - safety mechanism
  useEffect(() => {
    // Only check if preloader is not visible (page has loaded)
    if (isPreloaderBVisible) return // Don't check while preloader is showing
    
    const checkInterval = setInterval(() => {
      // Check if navbar should be visible but isn't
      const shouldBeVisible = !isPreloaderBVisible && !isPreloaderVisible
      
      if (shouldBeVisible && !isVisible) {
        // Navbar should be visible but isn't - force it to show
        setIsVisible(true)
        setIsNavbarHidden(false)
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Navbar: Periodic check detected navbar not visible, forcing it to show')
        }
      }
      
      // CRITICAL: Ensure navbar element has pointer events enabled when visible
      if (navbarRef.current && shouldBeVisible && isVisible) {
        const computedStyle = window.getComputedStyle(navbarRef.current)
        if (computedStyle.pointerEvents === 'none') {
          // Force pointer events to be enabled
          navbarRef.current.style.pointerEvents = 'auto'
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Navbar: Periodic check detected pointer events disabled, forcing them enabled')
          }
        }
      }
    }, 500) // Check every 500ms
    
    return () => clearInterval(checkInterval)
  }, [isVisible, isPreloaderBVisible, isPreloaderVisible])

  // Prefetch language route on hover for instant navigation
  const prefetchLanguageRoute = (newLocale: string) => {
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
    
    // Build target path and prefetch it
    const targetPath = `/${newLocale}${pathWithoutLocale}`
    router.prefetch(targetPath)
  }

  // Handle language change - optimized for instant response
  const handleLanguageChange = (newLocale: string) => {
    // Close dropdown immediately for instant UI feedback
    setLanguageDropdownOpen(false)
    
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
    
    // Build target path
    const targetPath = `/${newLocale}${pathWithoutLocale}`
    
    // Prefetch route immediately before showing preloader for faster loading
    router.prefetch(targetPath)
    
    // Use PreloaderB for all language switches (unified preloader system)
    // This ensures consistent behavior and proper state management
    setLanguageSwitch(true)
    showPreloaderB()
    
    // Navigate immediately using startTransition for non-blocking navigation
    // This keeps UI responsive during navigation
    startTransition(() => {
      router.push(targetPath)
    })
  }


  // Handle Home navigation (logo click)
  const handleHomeClick = (e: React.MouseEvent) => {
    // If on homepage, scroll to top
    const isOnHomePage = pathname === '/en' || pathname === '/' || pathname === '/es' || pathname === '/zh' || pathname === '/fr'
    if (isOnHomePage) {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // Check if we're on a project page - no PreloaderB needed (usePageTransition handles it)
    const isOnProjectPage = pathname.includes('/parque-tecnologico') || 
                           pathname.includes('/parque-logistico') || 
                           pathname.includes('/terminal-maritimo')
    
    // Only show PreloaderB for special pages (explore, deck, contact)
    // Project pages → home is fast and doesn't need PreloaderB
    const isOnSpecialPage = pathname.includes('/explore') || 
                           pathname.includes('/deck') || 
                           pathname.includes('/contact')
    
    e.preventDefault()
    
    // Only show PreloaderB for special pages, not project pages
    if (isOnSpecialPage) {
      showPreloaderB()
    }
    
    const homePath = currentLocale === 'en' ? '/en' : 
                    currentLocale === 'es' ? '/es' :
                    currentLocale === 'zh' ? '/zh' :
                    currentLocale === 'fr' ? '/fr' : '/en'
    // Navigate immediately without delay
    router.push(homePath)
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
        const elementPosition = faqElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - 20 // 20px offset to account for navbar
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
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
      className={`fixed left-0 right-0 z-[100] p-4 transition-all duration-500 ease-out ${
      // For deck, explore, and terminal-maritimo routes, only hide if navbar is explicitly hidden
      pathname.includes('/deck') || pathname.includes('/explore') || pathname.includes('/terminal-maritimo')
        ? (isNavbarHidden ? '-translate-y-full opacity-0' : 'top-0 translate-y-0 opacity-100')
        : (isNavbarHidden || isPreloaderVisible
            ? '-translate-y-full opacity-0' 
            : isVisible 
              ? 'top-0 translate-y-0 opacity-100' 
              : '-translate-y-full opacity-0')
    }`}
      style={{
        pointerEvents: (isNavbarHidden || isPreloaderVisible || !isVisible) ? 'none' : 'auto', // Always allow clicks when visible
        zIndex: 100, // Higher z-index to ensure it's above most content (below preloaders at 99999)
        isolation: 'isolate' // Create new stacking context
      }}>
      <nav className="container mx-auto">
        <div ref={mobileMenuRef} className={`${bgColor} backdrop-blur-xl border ${borderColor} rounded-2xl shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Link 
                href={currentLocale === 'en' ? '/en' : 
                      currentLocale === 'es' ? '/es' :
                      currentLocale === 'zh' ? '/zh' :
                      currentLocale === 'fr' ? '/fr' : '/en'} 
                className="cursor-pointer"
                onClick={handleHomeClick}
                onMouseEnter={() => {
                  const homePath = currentLocale === 'en' ? '/en' : 
                                  currentLocale === 'es' ? '/es' :
                                  currentLocale === 'zh' ? '/zh' :
                                  currentLocale === 'fr' ? '/fr' : '/en'
                  router.prefetch(homePath)
                }}
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

            {/* Right side: Language Dropdown + Hamburger Button */}
            <div className="flex items-center gap-3">
              {/* Language Dropdown - Always visible, to the left of hamburger */}
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
                        onMouseEnter={() => prefetchLanguageRoute(lang.code)}
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

              {/* Menu Button - Desktop and Mobile */}
              <button
                className={`p-2 rounded-lg transition-colors ${textColor} ${isOverWhiteBackground ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Menu with Animation - Desktop and Mobile */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-6 pb-6 border-t border-white/20">
              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleProjectNavigation('/terminal-maritimo')
                  }}
                  onMouseEnter={() => router.prefetch(`/${currentLocale}/terminal-maritimo`)}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.maritimeTerminal}
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleProjectNavigation('/parque-tecnologico')
                  }}
                  onMouseEnter={() => router.prefetch(`/${currentLocale}/parque-tecnologico`)}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.technologyPark}
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleProjectNavigation('/parque-logistico')
                  }}
                  onMouseEnter={() => router.prefetch(`/${currentLocale}/parque-logistico`)}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.logisticsPark}
                </button>
                <button 
                  onClick={handleFAQClick}
                  className={`text-sm ${hoverColor} transition-colors uppercase py-2 text-left ${textColor}`}
                >
                  {localizedText.faq}
                </button>

                <Button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    const contactPath = currentLocale === 'en' ? '/en/contact' : 
                                       currentLocale === 'es' ? '/es/contact' :
                                       currentLocale === 'zh' ? '/zh/contact' :
                                       currentLocale === 'fr' ? '/fr/contact' : '/en/contact'
                    // Navigate immediately - usePageTransition will handle PreloaderB automatically
                    router.push(contactPath)
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